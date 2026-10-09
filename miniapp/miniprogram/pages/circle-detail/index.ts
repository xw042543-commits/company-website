import {
  createCommunityComment, createSubmissionKey, deleteCommunityComment, deleteCommunityPost,
  listCommunityComments, listCommunityReplies,
  loadCommunityPost, reportCommunityTarget, setCommunityReaction,
  type CommunityComment, type CommunityPostDetail, type CommunityReportReason,
} from '../../services/community';
import { sessionStore } from '../../stores/session';
import {
  canUseCommunityWrite, codePointLength, createSubmissionState, editSubmission,
  errorCopy, finishSubmission, formatCommunityTime, mergeCommunityItems, prepareSubmission,
  unwrapCommunityRoute, type SubmissionState,
} from '../../utils/community-ui';
import { communityFeedRoute } from '../../utils/routes';

type ViewState = 'loading' | 'ready' | 'empty' | 'not-found' | 'unavailable' | 'unauthorized' | 'offline' | 'failed';
type CommentItem = CommunityComment & { displayTime: string; owner: boolean; avatarFailed: boolean; loadingReplies: boolean };
interface DataEvent extends WechatMiniprogram.BaseEvent { currentTarget: WechatMiniprogram.BaseEvent['currentTarget'] & { dataset: { id?: string; parent?: string; type?: string; reason?: CommunityReportReason } } }

const REPORT_REASONS: ReadonlyArray<{ code: CommunityReportReason; label: string }> = [
  { code: 'SPAM', label: '垃圾广告' }, { code: 'HARASSMENT', label: '骚扰攻击' },
  { code: 'SCAM', label: '疑似诈骗' }, { code: 'INAPPROPRIATE_CONTENT', label: '不当内容' },
  { code: 'OTHER', label: '其他问题' },
];
interface DetailRuntime {
  postId: string; commentSubmission: SubmissionState; reportSubmission: SubmissionState;
  generation: number; postGeneration: number; active: boolean; sessionStatus: string; unsubscribe: (() => void) | null;
}
type DetailDeps = {
  loadPost: typeof loadCommunityPost; listComments: typeof listCommunityComments; listReplies: typeof listCommunityReplies;
  createComment: typeof createCommunityComment; deleteComment: typeof deleteCommunityComment; deletePost: typeof deleteCommunityPost;
  report: typeof reportCommunityTarget; react: typeof setCommunityReaction; session: typeof sessionStore; createKey: typeof createSubmissionKey;
};
const detailDefaults: DetailDeps = { loadPost: loadCommunityPost, listComments: listCommunityComments, listReplies: listCommunityReplies,
  createComment: createCommunityComment, deleteComment: deleteCommunityComment, deletePost: deleteCommunityPost,
  report: reportCommunityTarget, react: setCommunityReaction, session: sessionStore, createKey: createSubmissionKey };
type DetailPage = WechatMiniprogram.Page.TrivialInstance & { _communityRuntime: DetailRuntime };
function detailRuntime(page: WechatMiniprogram.Page.TrivialInstance): DetailRuntime { return (page as DetailPage)._communityRuntime; }
function detailError(error: { kind: string; code: string }): ViewState {
  if (error.kind === 'unauthorized') return 'unauthorized';
  if (error.kind === 'unavailable') return error.code === 'NETWORK_UNAVAILABLE' || error.code === 'TRANSPORT_ERROR' ? 'offline' : 'unavailable';
  if (error.code === 'COMMUNITY_POST_NOT_FOUND') return 'not-found';
  return 'failed';
}

export function createCircleDetailPage(overrides: Partial<DetailDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...detailDefaults, ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: {
    postState: 'loading' as ViewState, commentsState: 'loading' as ViewState,
    post: null as CommunityPostDetail | null, postTime: '', comments: [] as CommentItem[],
    commentsCursor: null as string | null, loadingMoreComments: false, ownerPost: false,
    commentBody: '', commentCount: 0, replyParentId: null as string | null, replyAuthor: '', submittingComment: false,
    reportOpen: false, reportTargetType: 'POST' as 'POST' | 'COMMENT', reportTargetId: '',
    reportReasons: REPORT_REASONS, reportReason: 'SPAM' as CommunityReportReason, reportNote: '', reportNoteCount: 0, reporting: false,
    reactingTarget: null as string | null, postAvatarFailed: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const initial = deps.session.getSnapshot();
    const state: DetailRuntime = { postId: options.id ?? '', commentSubmission: createSubmissionState(), reportSubmission: createSubmissionState(),
      generation: 0, postGeneration: 0, active: true, sessionStatus: initial.status, unsubscribe: null };
    (this as DetailPage)._communityRuntime = state;
    state.unsubscribe = deps.session.subscribe((session) => {
      if (!state.active) return;
      const becameAuthenticated = state.sessionStatus !== 'authenticated' && session.status === 'authenticated';
      state.sessionStatus = session.status;
      if (becameAuthenticated) { void this.loadPost(); void this.loadComments(true); }
    });
    if (!/^[1-9]\d*$/.test(state.postId)) { this.setData({ postState: 'not-found', commentsState: 'failed' }); return; }
    void this.loadPost(); void this.loadComments(true);
    if (options.report === 'post') this.setData({ reportOpen: true, reportTargetType: 'POST', reportTargetId: state.postId });
  },
  onUnload() { const state = detailRuntime(this); state.active = false; state.unsubscribe?.(); state.unsubscribe = null; state.generation++; state.postGeneration++; },
  onPullDownRefresh() { void Promise.all([this.loadPost(), this.loadComments(true)]).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() { if (this.data.commentsState === 'ready' && this.data.commentsCursor && !this.data.loadingMoreComments) void this.loadComments(false); },
  retryPost() { void this.loadPost(); }, retryComments() { void this.loadComments(true); },
  async loadPost() {
    const state = detailRuntime(this); const generation = ++state.postGeneration;
    this.setData({ postState: 'loading' as ViewState });
    const result = await deps.loadPost(state.postId);
    if (!state.active || generation !== state.postGeneration) return;
    if (!result.ok) { this.setData({ postState: detailError(result.error) }); return; }
    this.setData({ post: result.value, ownerPost: result.value.ownedByMe, postAvatarFailed: false,
      postTime: formatCommunityTime(result.value.publishedAt), postState: 'ready' as ViewState });
  },
  async loadComments(reset: boolean) {
    if (!reset && (this.data.loadingMoreComments || this.data.commentsState !== 'ready')) return;
    const state = detailRuntime(this);
    const cursor = reset ? null : this.data.commentsCursor;
    if (!reset && !cursor) return;
    const generation = ++state.generation;
    if (reset) this.setData({ commentsState: 'loading' as ViewState, commentsCursor: null, loadingMoreComments: false });
    else this.setData({ loadingMoreComments: true });
    const result = await deps.listComments({ postId: state.postId, cursor, size: 20 });
    if (!state.active || generation !== state.generation) return;
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') {
        this.setData({ loadingMoreComments: false, commentsState: this.data.comments.length ? 'ready' : 'empty' }); return;
      }
      this.setData({ commentsState: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMoreComments: false }); return;
    }
    const prior = reset ? [] : this.data.comments;
    const merged = new Map(prior.map((comment: CommentItem) => [comment.id, comment]));
    result.value.items.forEach((comment) => merged.set(comment.id, this.decorateComment(comment)));
    const comments = [...merged.values()];
    this.setData({ comments, commentsCursor: result.value.nextCursor, loadingMoreComments: false,
      commentsState: comments.length ? 'ready' as ViewState : 'empty' as ViewState });
  },
  decorateComment(comment: CommunityComment): CommentItem {
    const existing = (this.data.comments as readonly CommentItem[]).find((item) => item.id === comment.id);
    return { ...comment, displayTime: formatCommunityTime(comment.createdAt), owner: comment.ownedByMe,
      avatarFailed: existing?.authorAvatarUrl === comment.authorAvatarUrl ? existing.avatarFailed : false, loadingReplies: false,
      replies: comment.replies.map((reply) => { const prior = existing?.replies.find((item) => item.id === reply.id) as (CommunityComment & { avatarFailed?: boolean }) | undefined;
        return { ...reply, owner: reply.ownedByMe, avatarFailed: prior?.authorAvatarUrl === reply.authorAvatarUrl ? prior.avatarFailed ?? false : false,
          displayTime: formatCommunityTime(reply.createdAt), loadingReplies: false }; }) as readonly CommunityComment[] };
  },
  updateComment(event: WechatMiniprogram.Input) {
    const body = event.detail.value;
    this.setData({ commentBody: body, commentCount: codePointLength(body) });
  },
  chooseReply(event: DataEvent) { this.setData({ replyParentId: event.currentTarget.dataset.parent ?? null, replyAuthor: String(event.currentTarget.dataset.id ?? '') }); },
  cancelReply() { this.setData({ replyParentId: null, replyAuthor: '' }); },
  async submitComment() {
    if (this.data.submittingComment || !(await this.ensureLogin())) return;
    const body = this.data.commentBody.trim();
    if (!body || codePointLength(body) > 1000) { wx.showToast({ title: '评论需为1至1000个字', icon: 'none' }); return; }
    const state = detailRuntime(this); const fingerprint = `${state.postId}\u0000${this.data.replyParentId ?? ''}\u0000${body}`;
    state.commentSubmission = prepareSubmission(editSubmission(state.commentSubmission, fingerprint), deps.createKey);
    this.setData({ submittingComment: true });
    const result = await deps.createComment({ body, postId: state.postId, parentCommentId: this.data.replyParentId, idempotencyKey: state.commentSubmission.key ?? '' });
    if (result.ok) {
      state.commentSubmission = finishSubmission(state.commentSubmission, 'completed');
      this.setData({ commentBody: '', commentCount: 0, replyParentId: null, replyAuthor: '', submittingComment: false });
      wx.showToast({ title: result.value.status === 'PENDING_REVIEW' ? '评论已提交审核' : '评论已发布', icon: 'success' });
      await Promise.all([this.loadPost(), this.loadComments(true)]);
    } else {
      state.commentSubmission = finishSubmission(state.commentSubmission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed');
      this.setData({ submittingComment: false }); wx.showToast({ title: errorCopy(result.error), icon: 'none' });
    }
  },
  async loadMoreReplies(event: DataEvent) {
    const parentId = event.currentTarget.dataset.parent; if (!parentId) return;
    const root = this.data.comments.find((comment: CommentItem) => comment.id === parentId);
    if (!root?.repliesNextCursor || root.loadingReplies) return;
    const state = detailRuntime(this); const generation = state.generation;
    this.setData({ comments: this.data.comments.map((comment: CommentItem) => comment.id === parentId ? { ...comment, loadingReplies: true } : comment) });
    const result = await deps.listReplies({ postId: state.postId, parentCommentId: parentId, cursor: root.repliesNextCursor, size: 20 });
    if (!state.active || generation !== state.generation) return;
    if (!result.ok) { this.setData({ comments: this.data.comments.map((comment: CommentItem) => comment.id === parentId ? { ...comment, loadingReplies: false } : comment) }); wx.showToast({ title: errorCopy(result.error), icon: 'none' }); return; }
    const replies = mergeCommunityItems(root.replies, result.value.items);
    this.setData({ comments: this.data.comments.map((comment: CommentItem) => comment.id === parentId ? this.decorateComment({ ...comment, replies, repliesNextCursor: result.value.nextCursor }) : comment) });
  },
  async reactPost() {
    if (!this.data.post || this.data.reactingTarget || !(await this.ensureLogin())) return;
    const post = this.data.post; const liked = !post.likedByMe; this.setData({ reactingTarget: post.id });
    const result = await deps.react({ targetType: 'POST', targetId: post.id, liked });
    if (result.ok) this.setData({ post: { ...post, likedByMe: liked, likeCount: Math.max(0, post.likeCount + (liked ? 1 : -1)) } });
    else wx.showToast({ title: errorCopy(result.error), icon: 'none' }); this.setData({ reactingTarget: null });
  },
  async reactComment(event: DataEvent) {
    const id = event.currentTarget.dataset.id; if (!id || this.data.reactingTarget || !(await this.ensureLogin())) return;
    const root = this.data.comments.find((comment: CommentItem) => comment.id === id);
    const reply = this.data.comments.flatMap((comment: CommentItem) => comment.replies).find((comment: CommunityComment) => comment.id === id);
    const target = root ?? reply; if (!target) return; const liked = !target.likedByMe; this.setData({ reactingTarget: id });
    const result = await deps.react({ targetType: 'COMMENT', targetId: id, liked });
    if (result.ok) this.setData({ comments: this.data.comments.map((comment: CommentItem) => this.updateCommentReaction(comment, id, liked)) });
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
    detailRuntime(this).reportSubmission = createSubmissionState();
  },
  closeReport() { if (!this.data.reporting) this.setData({ reportOpen: false }); },
  noop() { /* Prevent taps inside the sheet from closing it. */ },
  chooseReportReason(event: DataEvent) { const reason = event.currentTarget.dataset.reason; if (reason) this.setData({ reportReason: reason }); },
  updateReportNote(event: WechatMiniprogram.Input) { const note = event.detail.value; this.setData({ reportNote: note, reportNoteCount: codePointLength(note) }); },
  async submitReport() {
    if (this.data.reporting || this.data.reportNoteCount > 500 || !(await this.ensureLogin())) return;
    const state = detailRuntime(this); const fingerprint = `${this.data.reportTargetType}\u0000${this.data.reportTargetId}\u0000${this.data.reportReason}\u0000${this.data.reportNote}`;
    state.reportSubmission = prepareSubmission(editSubmission(state.reportSubmission, fingerprint), deps.createKey); this.setData({ reporting: true });
    const result = await deps.report({ targetType: this.data.reportTargetType, targetId: this.data.reportTargetId,
      reasonCode: this.data.reportReason, note: this.data.reportNote, idempotencyKey: state.reportSubmission.key ?? '' });
    if (result.ok) { state.reportSubmission = finishSubmission(state.reportSubmission, 'completed'); this.setData({ reportOpen: false, reporting: false }); wx.showToast({ title: '举报已提交', icon: 'success' }); }
    else { state.reportSubmission = finishSubmission(state.reportSubmission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed'); this.setData({ reporting: false }); wx.showToast({ title: errorCopy(result.error), icon: 'none' }); }
  },
  async deletePost() { if (!this.data.post?.ownedByMe || !(await confirmDelete('删除这条帖子？'))) return; const result = await deps.deletePost(detailRuntime(this).postId); if (!result.ok) { wx.showToast({ title: errorCopy(result.error), icon: 'none' }); return; } const route = unwrapCommunityRoute(communityFeedRoute()); if (route) wx.reLaunch({ url: route }); },
  async deleteComment(event: DataEvent) { const id = event.currentTarget.dataset.id; const owned = this.data.comments.some((comment: CommentItem) => comment.id === id ? comment.ownedByMe : comment.replies.some((reply: CommunityComment) => reply.id === id && reply.ownedByMe)); if (!id || !owned || !(await confirmDelete('删除这条评论？'))) return; const result = await deps.deleteComment(id); if (!result.ok) wx.showToast({ title: errorCopy(result.error), icon: 'none' }); else await Promise.all([this.loadPost(), this.loadComments(true)]); },
  postAvatarError() { this.setData({ postAvatarFailed: true }); },
  commentAvatarError(event: DataEvent) { const id = event.currentTarget.dataset.id; this.setData({ comments: this.data.comments.map((comment: CommentItem) => comment.id === id ? { ...comment, avatarFailed: true } : { ...comment, replies: comment.replies.map((reply: CommunityComment) => reply.id === id ? { ...reply, avatarFailed: true } : reply) }) }); },
  async ensureLogin(): Promise<boolean> { if (canUseCommunityWrite(deps.session.getSnapshot().status)) return true; const result = await deps.session.ensureAuthenticated(); if (!result.ok) wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return result.ok; },
  };
  return definition;
}

if (typeof Page !== 'undefined') Page(createCircleDetailPage());

function confirmDelete(content: string): Promise<boolean> {
  return new Promise((resolve) => wx.showModal({ title: '确认删除', content, confirmText: '删除', confirmColor: '#9f2f2f', success: (result) => resolve(result.confirm), fail: () => resolve(false) }));
}
