import {
  createCommunityRequestScope, deleteCommunityComment, deleteCommunityPost, listMyCommunityComments, listMyCommunityPosts,
  type CommunityMyComment, type CommunityMyPost,
} from '../../services/community';
import { sessionStore } from '../../stores/session';
import { errorCopy, formatCommunityTime, PENDING_REVIEW_NOTICE, statusCopy, unwrapCommunityRoute } from '../../utils/community-ui';
import { communityPostRoute } from '../../utils/routes';
import { communityCategoryLabel } from '../../utils/community-boards';
import { fetchCommunityImages } from '../../services/community-images';

type PersonalTab = 'posts' | 'comments';
type PersonalState = 'loading' | 'ready' | 'empty' | 'offline' | 'failed';
type PersonalPostItem = CommunityMyPost & { displayTime: string; statusLabel: string; categoryLabel: string };
type PersonalCommentItem = CommunityMyComment & { displayTime: string; statusLabel: string };
interface ItemEvent extends WechatMiniprogram.BaseEvent { currentTarget: WechatMiniprogram.BaseEvent['currentTarget'] & { dataset: { id?: string; post?: string; status?: string } } }

interface PersonalRuntime { generation: number; active: boolean; requestScope: string; submittedForReview: boolean }
type PersonalDeps = { navigate: (url: string) => void; listPosts: typeof listMyCommunityPosts; listComments: typeof listMyCommunityComments;
  deletePost: typeof deleteCommunityPost; deleteComment: typeof deleteCommunityComment; session: typeof sessionStore; createScope: typeof createCommunityRequestScope };
const personalDefaults: PersonalDeps = { navigate: (url) => wx.navigateTo({ url }), listPosts: listMyCommunityPosts,
  listComments: listMyCommunityComments, deletePost: deleteCommunityPost, deleteComment: deleteCommunityComment, session: sessionStore, createScope: createCommunityRequestScope };
type PersonalPage = WechatMiniprogram.Page.TrivialInstance & { _communityRuntime: PersonalRuntime };
function personalRuntime(page: WechatMiniprogram.Page.TrivialInstance): PersonalRuntime { return (page as PersonalPage)._communityRuntime; }

export function createCircleMePage(overrides: Partial<PersonalDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...personalDefaults, ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: {
    postImages: {},
    tab: 'posts' as PersonalTab, state: 'loading' as PersonalState,
    posts: [] as PersonalPostItem[], comments: [] as PersonalCommentItem[],
    nextCursor: null as string | null, loadingMore: false, deletingId: null as string | null, reviewNotice: '',
  },
  onLoad(options: Record<string, string | undefined> = {}) {
    const submittedForReview = options.review === 'submitted';
    (this as PersonalPage)._communityRuntime = { generation: 0, active: true, requestScope: deps.createScope(), submittedForReview };
    this.setData({ reviewNotice: submittedForReview ? PENDING_REVIEW_NOTICE : '' });
    void this.requireLoginAndLoad();
  },
  onUnload() { const state = personalRuntime(this); state.active = false; state.generation++; },
  onPullDownRefresh() { void this.load(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() { if (this.data.state === 'ready' && this.data.nextCursor && !this.data.loadingMore) void this.load(false); },
  switchTab(event: WechatMiniprogram.BaseEvent) {
    const tab = event.currentTarget.dataset.tab;
    if ((tab !== 'posts' && tab !== 'comments') || tab === this.data.tab) return;
    this.setData({ tab, posts: [], comments: [], nextCursor: null }, () => void this.load(true));
  },
  retry() { void this.requireLoginAndLoad(); },
  async requireLoginAndLoad() {
    if (deps.session.getSnapshot().status !== 'authenticated') {
      const result = await deps.session.ensureAuthenticated();
      if (!personalRuntime(this).active) return;
      if (!result.ok) { this.setData({ state: 'failed' as PersonalState }); return; }
    }
    await this.load(true);
  },
  async load(reset: boolean) {
    if (!reset && this.data.loadingMore) return;
    const cursor = reset ? null : this.data.nextCursor; if (!reset && !cursor) return;
    const state = personalRuntime(this); const request = ++state.generation;
    if (reset) this.setData({ state: 'loading' as PersonalState }); else this.setData({ loadingMore: true });
    const input = { cursor, size: 20, requestScope: state.requestScope };
    const result = this.data.tab === 'posts' ? await deps.listPosts(input) : await deps.listComments(input);
    if (!state.active || request !== state.generation) return;
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') {
        const items = this.data.tab === 'posts' ? this.data.posts : this.data.comments;
        this.setData({ loadingMore: false, state: items.length ? 'ready' : 'empty' }); return;
      }
      this.setData({ state: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMore: false }); return;
    }
    if (this.data.tab === 'posts') {
      const incoming = result.value.items as readonly CommunityMyPost[];
      const items = new Map<string, PersonalPostItem>((reset ? [] : this.data.posts).map((item: PersonalPostItem) => [item.id, item]));
      incoming.forEach((item) => items.set(item.id, { ...item, categoryLabel: communityCategoryLabel(item.category), displayTime: formatCommunityTime(item.createdAt), statusLabel: statusCopy(item.status) }));
      const posts = [...items.values()]; this.setData({ posts, reviewNotice: state.submittedForReview || posts.some((item) => item.status === 'PENDING_REVIEW') ? PENDING_REVIEW_NOTICE : '',
        nextCursor: result.value.nextCursor, loadingMore: false, state: posts.length ? 'ready' : 'empty' });
      const owner = deps.session.getSnapshot().account?.id;
      void fetchCommunityImages(incoming.map((post) => post.id), true).then((images) => {
        if (state.active && request === state.generation && owner === deps.session.getSnapshot().account?.id)
          this.setData({ postImages: { ...(reset ? {} : this.data.postImages), ...images } });
      });
    } else {
      const incoming = result.value.items as readonly CommunityMyComment[];
      const items = new Map<string, PersonalCommentItem>((reset ? [] : this.data.comments).map((item: PersonalCommentItem) => [item.id, item]));
      incoming.forEach((item) => items.set(item.id, { ...item, displayTime: formatCommunityTime(item.createdAt), statusLabel: statusCopy(item.status) }));
      const comments = [...items.values()]; this.setData({ comments, reviewNotice: state.submittedForReview || comments.some((item) => item.status === 'PENDING_REVIEW') ? PENDING_REVIEW_NOTICE : '',
        nextCursor: result.value.nextCursor, loadingMore: false, state: comments.length ? 'ready' : 'empty' });
    }
  },
  openItem(event: ItemEvent) {
    if (event.currentTarget.dataset.status !== 'PUBLISHED') return;
    const id = this.data.tab === 'posts' ? event.currentTarget.dataset.id : event.currentTarget.dataset.post;
    if (!id) return; const route = unwrapCommunityRoute(communityPostRoute(id)); if (route) deps.navigate(route);
  },
  async deleteItem(event: ItemEvent) {
    const id = event.currentTarget.dataset.id; if (!id || this.data.deletingId) return;
    const confirmed = await confirmDelete(); if (!confirmed || !personalRuntime(this).active) return;
    this.setData({ deletingId: id });
    const result = this.data.tab === 'posts' ? await deps.deletePost(id) : await deps.deleteComment(id);
    if (!personalRuntime(this).active) return;
    if (!result.ok) wx.showToast({ title: errorCopy(result.error), icon: 'none' });
    else await this.load(true);
    if (!personalRuntime(this).active) return;
    this.setData({ deletingId: null });
  },
  };
  return definition;
}

if (typeof Page !== 'undefined') Page(createCircleMePage());

function confirmDelete(): Promise<boolean> {
  return new Promise((resolve) => wx.showModal({ title: '确认删除', content: '删除后内容会保留“已删除”状态，且不能恢复。', confirmText: '删除', confirmColor: '#9f2f2f', success: (result) => resolve(result.confirm), fail: () => resolve(false) }));
}
