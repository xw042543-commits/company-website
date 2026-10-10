import { createCommunityPost, createCommunityRequestScope, createSubmissionKey } from '../../services/community';
import { sessionStore } from '../../stores/session';
import { canUseCommunityWrite, codePointLength, createSubmissionState, editSubmission, errorCopy, finishSubmission, prepareSubmission, unwrapCommunityRoute, type SubmissionState } from '../../utils/community-ui';
import { communityMeRoute, communityPostRoute } from '../../utils/routes';
import { COMMUNITY_BOARDS, isCommunityCategory } from '../../utils/community-boards';
import { isCommunityId, isCommunityTitle } from '../../utils/community-validation';
import { createUniversitySearchService, type UniversitySearchService } from '../../services/universities';

interface ComposeRuntime { submission: SubmissionState; active: boolean; schoolGeneration: number; search: UniversitySearchService['search'] }
type ComposeDeps = { createPost: typeof createCommunityPost; createKey: typeof createSubmissionKey; session: typeof sessionStore; searchUniversities?: UniversitySearchService['search'] };
const composeDefaults: ComposeDeps = { createPost: createCommunityPost, createKey: createSubmissionKey, session: sessionStore };
type ComposePage = WechatMiniprogram.Page.TrivialInstance & { _communityRuntime: ComposeRuntime };
function composeRuntime(page: WechatMiniprogram.Page.TrivialInstance): ComposeRuntime { return (page as ComposePage)._communityRuntime; }

export function createCircleComposePage(overrides: Partial<ComposeDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...composeDefaults, ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: { title: '', titleCount: 0, body: '', count: 0, category: 'GENERAL', categoryIndex: 0,
    categoryLabels: COMMUNITY_BOARDS.map((board) => board.label), universityId: null, universityName: '',
    schoolOpen: false, schoolQuery: '', schoolState: 'idle', schools: [], schoolPage: 1, schoolTotalPages: 0,
    submitting: false, notice: '' },
  onLoad() { (this as ComposePage)._communityRuntime = { submission: createSubmissionState(), active: true, schoolGeneration: 0,
    search: deps.searchUniversities ?? createUniversitySearchService(undefined, `compose-schools:${createCommunityRequestScope()}`).search }; },
  onUnload() { composeRuntime(this).active = false; },
  updateTitle(event: WechatMiniprogram.Input) { this.setData({ title: event.detail.value, titleCount: codePointLength(event.detail.value), notice: '' }); },
  changeCategory(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value); const board = COMMUNITY_BOARDS[index];
    if (board) this.setData({ categoryIndex: index, category: board.code, notice: '' });
  },
  async openSchools() { this.setData({ schoolOpen: true }); await this.loadSchools(1); },
  cancelSchools() { composeRuntime(this).schoolGeneration++; this.setData({ schoolOpen: false, schoolState: 'idle' }); },
  clearSchool() { this.setData({ universityId: null, universityName: '' }); },
  updateSchoolQuery(event: WechatMiniprogram.Input) { this.setData({ schoolQuery: event.detail.value }); },
  async searchSchools() { await this.loadSchools(1); },
  async retrySchools() { await this.loadSchools(this.data.schoolPage); },
  async nextSchools() { if (this.data.schoolPage < this.data.schoolTotalPages && this.data.schoolState !== 'loading') await this.loadSchools(this.data.schoolPage + 1); },
  async previousSchools() { if (this.data.schoolPage > 1 && this.data.schoolState !== 'loading') await this.loadSchools(this.data.schoolPage - 1); },
  async loadSchools(page: number) {
    const runtime = composeRuntime(this); const generation = ++runtime.schoolGeneration;
    this.setData({ schoolState: 'loading', schoolPage: page, schools: [] });
    const result = await runtime.search({ q: this.data.schoolQuery.trim(), page, size: 12 });
    if (!runtime.active || !this.data.schoolOpen || generation !== runtime.schoolGeneration) return;
    if (!result.ok) { this.setData({ schoolState: 'failed' }); return; }
    const schools = result.value.items.filter((school) => Number.isSafeInteger(school.id) && school.id > 0)
      .map((school) => ({ id: String(school.id), name: school.nameZh }));
    this.setData({ schools, schoolPage: result.value.page, schoolTotalPages: result.value.totalPages, schoolState: schools.length ? 'ready' : 'empty' });
  },
  selectSchool(event: WechatMiniprogram.TouchEvent) {
    const id = event.currentTarget.dataset.id;
    const school = this.data.schools.find((item: { id: string; name: string }) => item.id === id);
    if (school && isCommunityId(id)) { this.setData({ universityId: id, universityName: school.name }); this.cancelSchools(); }
  },
  updateBody(event: WechatMiniprogram.Input) {
    const body = event.detail.value;
    this.setData({ body, count: codePointLength(body), notice: '' });
  },
  async submit() {
    if (this.data.submitting) return;
    const body = this.data.body.trim();
    const title = this.data.title.trim();
    if (!isCommunityTitle(title)) { this.setData({ notice: '帖子标题需为1至60个字。' }); return; }
    if (!isCommunityCategory(this.data.category) || (this.data.universityId !== null && !isCommunityId(this.data.universityId))) {
      this.setData({ notice: '请选择有效分类与院校。' }); return;
    }
    const count = codePointLength(body);
    if (count < 1 || count > 2000) { this.setData({ notice: '帖子正文需为1至2000个字。' }); return; }
    const state = composeRuntime(this);
    const category = this.data.category; const universityId = this.data.universityId;
    this.setData({ submitting: true, notice: '' });
    if (!canUseCommunityWrite(deps.session.getSnapshot().status)) {
      const auth = await deps.session.ensureAuthenticated();
      if (!state.active) return;
      if (!auth.ok) { this.setData({ submitting: false, notice: '请先完成微信登录后再发布。' }); return; }
    }
    state.submission = prepareSubmission(editSubmission(state.submission, JSON.stringify(['POST', title, body, category, universityId])), deps.createKey);
    const result = await deps.createPost({ body, title, category, universityId, idempotencyKey: state.submission.key ?? '' });
    if (!state.active) return;
    if (!result.ok) {
      state.submission = finishSubmission(state.submission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed');
      this.setData({ submitting: false, notice: errorCopy(result.error) });
      return;
    }
    state.submission = finishSubmission(state.submission, 'completed');
    if (result.value.status === 'PENDING_REVIEW') {
      wx.showToast({ title: '已提交审核', icon: 'success' });
      const route = unwrapCommunityRoute(communityMeRoute());
      if (route) wx.redirectTo({ url: route });
      return;
    }
    const route = unwrapCommunityRoute(communityPostRoute(result.value.id));
    if (route) wx.redirectTo({ url: route });
    else this.setData({ submitting: false, notice: '帖子已发布，请返回U圈查看。' });
  },
  };
  return definition;
}

if (typeof Page !== 'undefined') Page(createCircleComposePage());
