import { listCommunityPosts, setCommunityReaction, type CommunityPostSummary } from '../../services/community';
import { sessionStore } from '../../stores/session';
import { canUseCommunityWrite, errorCopy, shouldRestartHotFeed, unwrapCommunityRoute } from '../../utils/community-ui';
import { communityComposeRoute, communityMeRoute, communityPostRoute } from '../../utils/routes';

type FeedState = 'loading' | 'ready' | 'empty' | 'offline' | 'failed';
interface PostEvent extends WechatMiniprogram.BaseEvent { detail: { id?: string; post?: CommunityPostSummary } }

let requestGeneration = 0;
let unsubscribeSession: (() => void) | null = null;

Page({
  data: {
    session: sessionStore.getSnapshot(), sort: 'latest' as 'latest' | 'hot', state: 'loading' as FeedState,
    posts: [] as CommunityPostSummary[], nextCursor: null as string | null, loadingMore: false,
    reactingId: null as string | null, skeletonRows: [1, 2, 3],
  },
  onLoad() {
    requestGeneration = 0;
    unsubscribeSession = sessionStore.subscribe((session) => this.setData({ session }));
    void this.loadFeed(true);
  },
  onShow() { this.setData({ session: sessionStore.getSnapshot() }); },
  onUnload() { unsubscribeSession?.(); unsubscribeSession = null; requestGeneration++; },
  onPullDownRefresh() { void this.loadFeed(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() {
    if (this.data.state === 'ready' && this.data.nextCursor && !this.data.loadingMore) void this.loadFeed(false);
  },
  switchSort(event: WechatMiniprogram.BaseEvent) {
    const sort = event.currentTarget.dataset.sort;
    if ((sort !== 'latest' && sort !== 'hot') || sort === this.data.sort) return;
    this.setData({ sort, posts: [], nextCursor: null }, () => void this.loadFeed(true));
  },
  retry() { void this.loadFeed(true); },
  async openCompose() {
    if (!(await this.ensureLogin())) return;
    const route = unwrapCommunityRoute(communityComposeRoute());
    if (route) wx.navigateTo({ url: route });
  },
  async openMine() {
    if (!(await this.ensureLogin())) return;
    const route = unwrapCommunityRoute(communityMeRoute());
    if (route) wx.navigateTo({ url: route });
  },
  openPost(event: PostEvent) {
    if (!event.detail.id) return;
    const route = unwrapCommunityRoute(communityPostRoute(event.detail.id));
    if (route) wx.navigateTo({ url: route });
  },
  reportPost(event: PostEvent) {
    if (!event.detail.id) return;
    const route = unwrapCommunityRoute(communityPostRoute(event.detail.id));
    if (route) wx.navigateTo({ url: `${route}&report=post` });
  },
  async toggleLike(event: PostEvent) {
    const post = event.detail.post;
    if (!post || this.data.reactingId || !(await this.ensureLogin())) return;
    this.setData({ reactingId: post.id });
    const liked = !post.likedByMe;
    const result = await setCommunityReaction({ targetType: 'POST', targetId: post.id, liked });
    if (result.ok) {
      this.setData({ posts: this.data.posts.map((item) => item.id === post.id ? {
        ...item, likedByMe: liked, likeCount: Math.max(0, item.likeCount + (liked ? 1 : -1)),
      } : item) });
    } else if (result.error.code !== 'REQUEST_SUPERSEDED') wx.showToast({ title: errorCopy(result.error), icon: 'none' });
    this.setData({ reactingId: null });
  },
  async loadFeed(reset: boolean, restarted = false): Promise<void> {
    if (!reset && this.data.loadingMore) return;
    const cursor = reset ? null : this.data.nextCursor;
    if (!reset && !cursor) return;
    const generation = ++requestGeneration;
    if (reset) this.setData({ state: 'loading' as FeedState, nextCursor: null });
    else this.setData({ loadingMore: true });
    const result = await listCommunityPosts({ sort: this.data.sort, cursor, size: 20 });
    if (generation !== requestGeneration) return;
    if (!result.ok) {
      if (result.error.code === 'REQUEST_SUPERSEDED') return;
      if (!restarted && shouldRestartHotFeed(this.data.sort, cursor, result.error)) {
        this.setData({ posts: [], nextCursor: null, loadingMore: false });
        await this.loadFeed(true, true); return;
      }
      this.setData({ state: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMore: false });
      return;
    }
    const merged = new Map((reset ? [] : this.data.posts).map((post) => [post.id, post]));
    result.value.items.forEach((post) => merged.set(post.id, post));
    const posts = [...merged.values()];
    this.setData({ posts, nextCursor: result.value.nextCursor, loadingMore: false,
      state: posts.length === 0 ? 'empty' as FeedState : 'ready' as FeedState });
  },
  async ensureLogin(): Promise<boolean> {
    if (canUseCommunityWrite(sessionStore.getSnapshot().status)) return true;
    wx.showLoading({ title: '登录中', mask: true });
    const result = await sessionStore.ensureAuthenticated();
    wx.hideLoading();
    if (!result.ok) wx.showToast({ title: '登录未完成，请重试', icon: 'none' });
    return result.ok;
  },
});
