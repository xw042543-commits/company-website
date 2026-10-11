import { createCommunityRequestScope, listCommunityPosts, setCommunityReaction, type CommunityPostSummary } from '../../services/community';
import { sessionStore } from '../../stores/session';
import { canUseCommunityWrite, errorCopy, shouldRestartHotFeed, unwrapCommunityRoute } from '../../utils/community-ui';
import { communityComposeRoute, communityMeRoute, communityPostRoute } from '../../utils/routes';
import { COMMUNITY_BOARDS, isCommunityCategory } from '../../utils/community-boards';
import { isCommunityId } from '../../utils/community-validation';
import { createUniversitySearchService, type UniversitySearchService } from '../../services/universities';

type FeedState = 'loading' | 'ready' | 'empty' | 'offline' | 'failed' | 'select-school';
interface PostEvent extends WechatMiniprogram.BaseEvent { detail: { id?: string; post?: CommunityPostSummary } }

interface FeedRuntime { generation: number; active: boolean; requestScope: string; sessionStatus: string; unsubscribe: (() => void) | null;
  schoolGeneration: number; schoolCommittedQuery: string; search: UniversitySearchService['search'] }
type CircleDeps = { listPosts: typeof listCommunityPosts; react: typeof setCommunityReaction; session: typeof sessionStore; createScope: typeof createCommunityRequestScope; searchUniversities?: UniversitySearchService['search'] };
const circleDefaults: CircleDeps = { listPosts: listCommunityPosts, react: setCommunityReaction, session: sessionStore, createScope: createCommunityRequestScope };
type FeedPage = WechatMiniprogram.Page.TrivialInstance & { _communityRuntime: FeedRuntime };
function runtime(page: WechatMiniprogram.Page.TrivialInstance): FeedRuntime { return (page as FeedPage)._communityRuntime; }

export function createCirclePage(overrides: Partial<CircleDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...circleDefaults, ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: {
    session: sessionStore.getSnapshot(), sort: 'latest' as 'latest' | 'hot', state: 'loading' as FeedState,
    posts: [] as CommunityPostSummary[], nextCursor: null as string | null, loadingMore: false,
    reactingId: null as string | null, skeletonRows: [1, 2, 3],
    mode: 'plaza', category: '', boards: [{ code: '', label: '全部' }, ...COMMUNITY_BOARDS],
    universityId: null as string | null, universityName: '',
    schoolOpen: false, schoolQuery: '', schoolState: 'idle', schools: [], schoolPage: 1, schoolTotalPages: 0,
  },
  onLoad() {
    const initial = deps.session.getSnapshot();
    const requestScope = deps.createScope();
    const state: FeedRuntime = { generation: 0, active: true, requestScope, sessionStatus: initial.status, unsubscribe: null,
      schoolGeneration: 0, schoolCommittedQuery: '', search: deps.searchUniversities ?? createUniversitySearchService(undefined, `feed-schools:${requestScope}`).search };
    (this as FeedPage)._communityRuntime = state;
    this.setData({ session: initial });
    state.unsubscribe = deps.session.subscribe((session) => {
      if (!state.active) return;
      const becameAuthenticated = state.sessionStatus !== 'authenticated' && session.status === 'authenticated';
      state.sessionStatus = session.status;
      this.setData({ session });
      if (becameAuthenticated) void this.loadFeed(true);
    });
    void this.loadFeed(true);
  },
  onShow() { this.setData({ session: deps.session.getSnapshot() }); },
  onUnload() { const state = runtime(this); state.active = false; state.unsubscribe?.(); state.unsubscribe = null; state.generation++; },
  onPullDownRefresh() { void this.loadFeed(true).finally(() => wx.stopPullDownRefresh()); },
  onReachBottom() {
    if (this.data.state === 'ready' && this.data.nextCursor && !this.data.loadingMore) void this.loadFeed(false);
  },
  switchSort(event: WechatMiniprogram.BaseEvent) {
    const sort = event.currentTarget.dataset.sort;
    if ((sort !== 'latest' && sort !== 'hot') || sort === this.data.sort) return;
    this.setData({ sort }); this.resetScope();
  },
  switchMode(event: WechatMiniprogram.BaseEvent) {
    const mode = event.currentTarget.dataset.mode;
    if ((mode !== 'plaza' && mode !== 'campus') || mode === this.data.mode) return;
    this.setData({ mode }); this.resetScope();
  },
  switchCategory(event: WechatMiniprogram.BaseEvent) {
    const category = event.currentTarget.dataset.category;
    if ((category !== '' && !isCommunityCategory(category)) || category === this.data.category) return;
    this.setData({ category }); this.resetScope();
  },
  resetScope() {
    runtime(this).generation++;
    this.setData({ posts: [], nextCursor: null, loadingMore: false }, () => void this.loadFeed(true));
  },
  async openSchools() { this.setData({ schoolOpen: true }); await this.searchSchools(); },
  cancelSchools() { runtime(this).schoolGeneration++; this.setData({ schoolOpen: false, schoolState: 'idle' }); },
  updateSchoolQuery(event: WechatMiniprogram.Input) { this.setData({ schoolQuery: event.detail.value }); },
  async searchSchools() { runtime(this).schoolCommittedQuery = this.data.schoolQuery.trim(); this.setData({ schoolTotalPages: 0 }); await this.loadSchools(1); },
  async retrySchools() { await this.loadSchools(this.data.schoolPage); },
  async nextSchools() { if (this.data.schoolPage < this.data.schoolTotalPages && this.data.schoolState !== 'loading') await this.loadSchools(this.data.schoolPage + 1); },
  async previousSchools() { if (this.data.schoolPage > 1 && this.data.schoolState !== 'loading') await this.loadSchools(this.data.schoolPage - 1); },
  async loadSchools(page: number) {
    const state = runtime(this); const generation = ++state.schoolGeneration;
    this.setData({ schoolState: 'loading', schoolPage: page, schools: [] });
    const result = await state.search({ q: state.schoolCommittedQuery, page, size: 12 });
    if (!state.active || !this.data.schoolOpen || generation !== state.schoolGeneration) return;
    if (!result.ok) { this.setData({ schoolState: 'failed' }); return; }
    const schools = result.value.items.filter((school) => Number.isSafeInteger(school.id) && school.id > 0)
      .map((school) => ({ id: String(school.id), name: school.nameZh }));
    this.setData({ schools, schoolPage: result.value.page, schoolTotalPages: result.value.totalPages, schoolState: schools.length ? 'ready' : 'empty' });
  },
  selectSchool(event: WechatMiniprogram.TouchEvent) {
    const id = event.currentTarget.dataset.id;
    const school = this.data.schools.find((item: { id: string; name: string }) => item.id === id);
    if (!school || !isCommunityId(id)) return;
    this.setData({ universityId: id, universityName: school.name, mode: 'campus' });
    this.cancelSchools(); this.resetScope();
  },
  noop() {},
  retry() { void this.loadFeed(true); },
  async openCompose() {
    if (!(await this.ensureLogin())) return;
    if (!runtime(this).active) return;
    const route = unwrapCommunityRoute(communityComposeRoute());
    if (route) wx.navigateTo({ url: route });
  },
  async openMine() {
    if (!(await this.ensureLogin())) return;
    if (!runtime(this).active) return;
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
    const result = await deps.react({ targetType: 'POST', targetId: post.id, liked });
    if (!runtime(this).active) return;
    if (result.ok) {
      this.setData({ posts: this.data.posts.map((item: CommunityPostSummary) => item.id === post.id ? {
        ...item, likedByMe: liked, likeCount: Math.max(0, item.likeCount + (liked ? 1 : -1)),
      } : item) });
    } else if (result.error.code !== 'REQUEST_SUPERSEDED') wx.showToast({ title: errorCopy(result.error), icon: 'none' });
    this.setData({ reactingId: null });
  },
  async loadFeed(reset: boolean, restarted = false): Promise<void> {
    if (this.data.mode === 'campus' && !this.data.universityId) {
      this.setData({ state: 'select-school', nextCursor: null, loadingMore: false }); return;
    }
    if (!reset && this.data.loadingMore) return;
    const cursor = reset ? null : this.data.nextCursor;
    if (!reset && !cursor) return;
    const state = runtime(this);
    const generation = ++state.generation;
    if (reset) this.setData({ state: 'loading' as FeedState, nextCursor: null, loadingMore: false });
    else this.setData({ loadingMore: true });
    const result = await deps.listPosts({ sort: this.data.sort, cursor, size: 20, requestScope: state.requestScope,
      ...(this.data.category ? { category: this.data.category } : {}),
      ...(this.data.mode === 'campus' ? { universityId: this.data.universityId } : {}) });
    if (!state.active || generation !== state.generation) return;
    if (!result.ok) {
      if (!restarted && shouldRestartHotFeed(this.data.sort, cursor, result.error)) {
        this.setData({ posts: [], nextCursor: null, loadingMore: false });
        await this.loadFeed(true, true); return;
      }
      this.setData({ state: result.error.kind === 'unavailable' ? 'offline' : 'failed', loadingMore: false });
      return;
    }
    const merged = new Map((reset ? [] : this.data.posts).map((post: CommunityPostSummary) => [post.id, post]));
    result.value.items.forEach((post) => merged.set(post.id, post));
    const posts = [...merged.values()];
    this.setData({ posts, nextCursor: result.value.nextCursor, loadingMore: false,
      state: posts.length === 0 ? 'empty' as FeedState : 'ready' as FeedState });
  },
  async ensureLogin(): Promise<boolean> {
    if (canUseCommunityWrite(deps.session.getSnapshot().status)) return true;
    wx.showLoading({ title: '登录中', mask: true });
    const result = await deps.session.ensureAuthenticated();
    wx.hideLoading();
    if (!runtime(this).active) return false;
    if (!result.ok) wx.showToast({ title: '登录未完成，请重试', icon: 'none' });
    return result.ok;
  },
  };
  return definition;
}

if (typeof Page !== 'undefined') Page(createCirclePage());
