import {
  createCommunityComment, createSubmissionKey, deleteCommunityComment, deleteCommunityPost,
  listCommunityComments, listCommunityReplies, listMyCommunityComments, listMyCommunityPosts,
  loadCommunityPost, reportCommunityTarget, setCommunityReaction,
  type CommunityComment, type CommunityPostDetail, type CommunityReportReason,
} from '../../services/community';
import { sessionStore } from '../../stores/session';
import {
  canDeleteOwnedContent, canUseCommunityWrite, codePointLength, createSubmissionState, editSubmission,
  errorCopy, finishSubmission, formatCommunityTime, mergeCommunityItems, prepareSubmission,
  unwrapCommunityRoute, type SubmissionState,
} from '../../utils/community-ui';
import { communityFeedRoute } from '../../utils/routes';

type ViewState = 'loading' | 'ready' | 'empty' | 'offline' | 'failed';
type CommentItem = CommunityComment & { displayTime: string; owner: boolean; loadingReplies: boolean };
interface DataEvent extends WechatMiniprogram.BaseEvent { currentTarget: WechatMiniprogram.BaseEvent['currentTarget'] & { dataset: { id?: string; parent?: string; type?: string; reason?: CommunityReportReason } } }

const REPORT_REASONS: ReadonlyArray<{ code: CommunityReportReason; label: string }> = [
  { code: 'SPAM', label: '垃圾广告' }, { code: 'HARASSMENT', label: '骚扰攻击' },
  { code: 'SCAM', label: '疑似诈骗' }, { code: 'INAPPROPRIATE_CONTENT', label: '不当内容' },
  { code: 'OTHER', label: '其他问题' },
];
let postId = '';
let commentSubmission: SubmissionState = createSubmissionState();
let reportSubmission: SubmissionState = createSubmissionState();
let ownedCommentIds = new Set<string>();
let ownerPost = false;
let commentGeneration = 0;

Page({
  data: {
    postState: 'loading' as ViewState, commentsState: 'loading' as ViewState,
    post: null as CommunityPostDetail | null, postTime: '', comments: [] as CommentItem[],
    commentsCursor: null as string | null, loadingMoreComments: false, ownerPost: false,
    commentBody: '', commentCount: 0, replyParentId: null as string | null, replyAuthor: '', submittingComment: false,
    reportOpen: false, reportTargetType: 'POST' as 'POST' | 'COMMENT', reportTargetId: '',
    reportReasons: REPORT_REASONS, reportReason: 'SPAM' as CommunityReportReason, reportNote: '', reportNoteCount: 0, reporting: false,
    reactingTarget: null as string | null,
  },
  onLoad(options: Record<string, string | undefined>) {
    postId = options.id ?? '';
    commentSubmission = createSubmissionState(); reportSubmission = createSubmissionState();
    ownedCommentIds = new Set(); ownerPost = false; commentGeneration = 0;
    if (!/^[1-9]\d*$/.test(postId)) { this.setData({ postState: 'failed', commentsState: 'failed' }); return; }
    void this.loadPost(); void this.loadComments(true); void this.loadOwnership();
    if (options.report === 'post') this.setData({ reportOpen: true, reportTargetType: 'POST', reportTargetId: postId });
  },
  onPullDownRefresh() { void Promise.all([this.loadPost(), this.loadComments(true), this.loadOwnership()]).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() { if (this.data.commentsCursor && !this.data.loadingMoreComments) void this.loadComments(false); },
  retryPost() { void this.loadPost(); }, retryComments() { void this.loadComments(true); },
  async loadPost() {
    this.setData({ postState: 'loading' as ViewState });
    const result = await loadCommunityPost(postId);
    if (!result.ok) { this.setData({ postState: result.error.kind === 'unavailable' ? 'offline' : 'failed' }); return; }
    this.setData({ post: result.value, postTime: formatCommunityTime(result.value.publishedAt), postState: 'ready' as ViewState });
  },
  async loadComments(reset: boolean) {
    if (!reset && this.data.loadingMoreComments) return;
    const cursor = reset ? null : this.data.commentsCursor;
    if (!reset && !cursor) return;
    const generation = ++commentGeneration;
    if (reset) this.setData({ commentsState: 'loading' as ViewState }); else this.setData({ loadingMoreComments: true });
    const result = await listCommunityComments({ postId, cursor, size: 20 });
    if (generation !== commentGeneration) return;
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') return;
      this.setData({ commentsState: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMoreComments: false }); return;
    }
    const prior = reset ? [] : this.data.comments;
    const merged = new Map(prior.map((comment) => [comment.id, comment]));
    result.value.items.forEach((comment) => merged.set(comment.id, this.decorateComment(comment)));
    const comments = [...merged.values()];
    this.setData({ comments, commentsCursor: result.value.nextCursor, loadingMoreComments: false,
      commentsState: comments.length ? 'ready' as ViewState : 'empty' as ViewState });
  },
  decorateComment(comment: CommunityComment): CommentItem {
    return { ...comment, displayTime: formatCommunityTime(comment.createdAt), owner: ownedCommentIds.has(comment.id), loadingReplies: false,
      replies: comment.replies.map((reply) => ({ ...reply, owner: ownedCommentIds.has(reply.id), displayTime: formatCommunityTime(reply.createdAt), loadingReplies: false })) as readonly CommunityComment[] };
  },
  async loadOwnership() {
    if (sessionStore.getSnapshot().status !== 'authenticated') return;
    const [posts, comments] = await Promise.all([listMyCommunityPosts({ size: 50 }), listMyCommunityComments({ size: 50 })]);
    if (posts.ok) ownerPost = posts.value.items.some((post) => post.id === postId);
    if (comments.ok) ownedCommentIds = new Set(comments.value.items.map((comment) => comment.id));
    this.setData({ ownerPost, comments: this.data.comments.map((comment) => this.decorateComment(comment)) });
  },
  updateComment(event: WechatMiniprogram.Input) {
    const body = event.detail.value; commentSubmission = editSubmission(commentSubmission, body);
    this.setData({ commentBody: body, commentCount: codePointLength(body) });
  },
  chooseReply(event: DataEvent) { this.setData({ replyParentId: event.currentTarget.dataset.parent ?? null, replyAuthor: String(event.currentTarget.dataset.id ?? '') }); },
  cancelReply() { this.setData({ replyParentId: null, replyAuthor: '' }); },
  async submitComment() {
    if (this.data.submittingComment || !(await this.ensureLogin())) return;
    const body = this.data.commentBody.trim();
    if (!body || codePointLength(body) > 1000) { wx.showToast({ title: '评论需为1至1000个字', icon: 'none' }); return; }
    commentSubmission = prepareSubmission(editSubmission(commentSubmission, body), createSubmissionKey);
    this.setData({ submittingComment: true });
    const result = await createCommunityComment({ body, postId, parentCommentId: this.data.replyParentId, idempotencyKey: commentSubmission.key ?? '' });
    if (result.ok) {
      commentSubmission = finishSubmission(commentSubmission, 'completed');
      this.setData({ commentBody: '', commentCount: 0, replyParentId: null, replyAuthor: '', submittingComment: false });
      wx.showToast({ title: result.value.status === 'PENDING_REVIEW' ? '评论已提交审核' : '评论已发布', icon: 'success' });
      await this.loadComments(true);
    } else {
      commentSubmission = finishSubmission(commentSubmission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed');
      this.setData({ submittingComment: false }); wx.showToast({ title: errorCopy(result.error), icon: 'none' });
    }
  },
  async loadMoreReplies(event: DataEvent) {
    const parentId = event.currentTarget.dataset.parent; if (!parentId) return;
    const root = this.data.comments.find((comment) => comment.id === parentId);
    if (!root?.repliesNextCursor || root.loadingReplies) return;
    this.setData({ comments: this.data.comments.map((comment) => comment.id === parentId ? { ...comment, loadingReplies: true } : comment) });
    const result = await listCommunityReplies({ postId, parentCommentId: parentId, cursor: root.repliesNextCursor, size: 20 });
    if (!result.ok) { this.setData({ comments: this.data.comments.map((comment) => comment.id === parentId ? { ...comment, loadingReplies: false } : comment) }); wx.showToast({ title: errorCopy(result.error), icon: 'none' }); return; }
    const replies = mergeCommunityItems(root.replies, result.value.items);
    this.setData({ comments: this.data.comments.map((comment) => comment.id === parentId ? this.decorateComment({ ...comment, replies, repliesNextCursor: result.value.nextCursor }) : comment) });
  },
  async reactPost() {
    if (!this.data.post || this.data.reactingTarget || !(await this.ensureLogin())) return;
    const post = this.data.post; const liked = !post.likedByMe; this.setData({ reactingTarget: post.id });
    const result = await setCommunityReaction({ targetType: 'POST', targetId: post.id, liked });
    if (result.ok) this.setData({ post: { ...post, likedByMe: liked, likeCount: Math.max(0, post.likeCount + (liked ? 1 : -1)) } });
    else wx.showToast({ title: errorCopy(result.error), icon: 'none' }); this.setData({ reactingTarget: null });
  },
  async reactComment(event: DataEvent) {
    const id = event.currentTarget.dataset.id; if (!id || this.data.reactingTarget || !(await this.ensureLogin())) return;
    const root = this.data.comments.find((comment) => comment.id === id);
    const reply = this.data.comments.flatMap((comment) => comment.replies).find((comment) => comment.id === id);
    const target = root ?? reply; if (!target) return; const liked = !target.likedByMe; this.setData({ reactingTarget: id });
    const result = await setCommunityReaction({ targetType: 'COMMENT', targetId: id, liked });
    if (result.ok) this.setData({ comments: this.data.comments.map((comment) => this.updateCommentReaction(comment, id, liked)) });
    else wx.showToast({ title: errorCopy(result.error), icon: 'none' }); this.setData({ reactingTarget: null });
  },
  updateCommentReaction(comment: CommentItem, id: string, liked: boolean): CommentItem {
    const update = (item: CommunityComment) => item.id === id ? { ...item, likedByMe: liked, likeCount: Math.max(0, item.likeCount + (liked ? 1 : -1)) } : item;
    return this.decorateComment({ ...update(comment), replies: comment.replies.map(update) });
  },
  openReport(event: DataEvent) {
    const id = event.currentTarget.dataset.id; const type = event.currentTarget.dataset.type;
    if (!id || (type !== 'POST' && type !== 'COMMENT')) return;
    this.setData({ reportOpen: true, reportTargetType: type, reportTargetId: id, reportReason: 'SPAM', reportNote: '', reportNoteCount: 0 });
    reportSubmission = createSubmissionState();
  },
  closeReport() { if (!this.data.reporting) this.setData({ reportOpen: false }); },
  noop() { /* Prevent taps inside the sheet from closing it. */ },
  chooseReportReason(event: DataEvent) { const reason = event.currentTarget.dataset.reason; if (reason) this.setData({ reportReason: reason }); },
  updateReportNote(event: WechatMiniprogram.Input) { const note = event.detail.value; reportSubmission = editSubmission(reportSubmission, note); this.setData({ reportNote: note, reportNoteCount: codePointLength(note) }); },
  async submitReport() {
    if (this.data.reporting || this.data.reportNoteCount > 500 || !(await this.ensureLogin())) return;
    reportSubmission = prepareSubmission(reportSubmission, createSubmissionKey); this.setData({ reporting: true });
    const result = await reportCommunityTarget({ targetType: this.data.reportTargetType, targetId: this.data.reportTargetId,
      reasonCode: this.data.reportReason, note: this.data.reportNote, idempotencyKey: reportSubmission.key ?? '' });
    if (result.ok) { reportSubmission = finishSubmission(reportSubmission, 'completed'); this.setData({ reportOpen: false, reporting: false }); wx.showToast({ title: '举报已提交', icon: 'success' }); }
    else { reportSubmission = finishSubmission(reportSubmission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed'); this.setData({ reporting: false }); wx.showToast({ title: errorCopy(result.error), icon: 'none' }); }
  },
  async deletePost() { if (!ownerPost || !(await confirmDelete('删除这条帖子？'))) return; const result = await deleteCommunityPost(postId); if (!result.ok) { wx.showToast({ title: errorCopy(result.error), icon: 'none' }); return; } const route = unwrapCommunityRoute(communityFeedRoute()); if (route) wx.reLaunch({ url: route }); },
  async deleteComment(event: DataEvent) { const id = event.currentTarget.dataset.id; if (!id || !canDeleteOwnedContent(id, ownedCommentIds) || !(await confirmDelete('删除这条评论？'))) return; const result = await deleteCommunityComment(id); if (!result.ok) wx.showToast({ title: errorCopy(result.error), icon: 'none' }); else await this.loadComments(true); },
  async ensureLogin(): Promise<boolean> { if (canUseCommunityWrite(sessionStore.getSnapshot().status)) return true; const result = await sessionStore.ensureAuthenticated(); if (!result.ok) wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return result.ok; },
});

function confirmDelete(content: string): Promise<boolean> {
  return new Promise((resolve) => wx.showModal({ title: '确认删除', content, confirmText: '删除', confirmColor: '#9f2f2f', success: (result) => resolve(result.confirm), fail: () => resolve(false) }));
}
