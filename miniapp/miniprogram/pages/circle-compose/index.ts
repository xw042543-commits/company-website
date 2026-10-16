import { createCommunityPost, createCommunityRequestScope, createSubmissionKey } from '../../services/community';
import { sessionStore } from '../../stores/session';
import { canUseCommunityWrite, codePointLength, createSubmissionState, editSubmission, submissionErrorCopy, finishSubmission, PENDING_REVIEW_NOTICE, prepareSubmission, unwrapCommunityRoute, type SubmissionState } from '../../utils/community-ui';
import { communityMeRoute, communityPostRoute } from '../../utils/routes';
import { COMMUNITY_BOARDS, isCommunityCategory } from '../../utils/community-boards';
import { isCommunityId, isCommunityTitle } from '../../utils/community-validation';
import { createUniversitySearchService, type UniversitySearchService } from '../../services/universities';
import { createImageUploader } from '../../services/community-images';
import { ImageUploadQueue } from '../../utils/community-image-queue';
import { nativeImageDraftStore, removeDraftFile } from '../../utils/community-image-draft';
import { chooseDraftImages, prepareDraftImage } from '../../utils/community-image-selection';

interface ComposeRuntime { submission: SubmissionState; active: boolean; schoolGeneration: number; schoolCommittedQuery: string; search: UniversitySearchService['search'];
  owner?: number; queue?: ImageUploadQueue; uploader?: ReturnType<typeof createImageUploader>; drafts?: ReturnType<typeof nativeImageDraftStore>; unsubscribe?: () => void; published?: boolean }
type ComposeDeps = { createPost: typeof createCommunityPost; createKey: typeof createSubmissionKey; session: typeof sessionStore; searchUniversities?: UniversitySearchService['search'];
  createUploader: typeof createImageUploader; draftStore: typeof nativeImageDraftStore; chooseImages: typeof chooseDraftImages; prepareImage: typeof prepareDraftImage; removeImageFile: typeof removeDraftFile };
const composeDefaults: ComposeDeps = { createPost: createCommunityPost, createKey: createSubmissionKey, session: sessionStore,
  createUploader: createImageUploader, draftStore: nativeImageDraftStore, chooseImages: chooseDraftImages, prepareImage: prepareDraftImage, removeImageFile: removeDraftFile };
type ComposePage = WechatMiniprogram.Page.TrivialInstance & { _communityRuntime: ComposeRuntime };
function composeRuntime(page: WechatMiniprogram.Page.TrivialInstance): ComposeRuntime { return (page as ComposePage)._communityRuntime; }

export function createCircleComposePage(overrides: Partial<ComposeDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...composeDefaults, ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: { title: '', titleCount: 0, body: '', count: 0, category: 'GENERAL', categoryIndex: 0,
    categoryLabels: COMMUNITY_BOARDS.map((board) => board.label), universityId: null, universityName: '',
    schoolOpen: false, schoolQuery: '', schoolState: 'idle', schools: [], schoolPage: 1, schoolTotalPages: 0,
    submitting: false, notice: '', images: [], choosingImages: false, imagesBusy: false },
  onLoad() { (this as ComposePage)._communityRuntime = { submission: createSubmissionState(), active: true, schoolGeneration: 0, schoolCommittedQuery: '',
    search: deps.searchUniversities ?? createUniversitySearchService(undefined, `compose-schools:${createCommunityRequestScope()}`).search };
    this.initializeImages(true);
    const state = composeRuntime(this);
    state.unsubscribe = deps.session.subscribe?.(() => {
      if (!state.active || state.owner === undefined || deps.session.getSnapshot().account?.id === state.owner) return;
      this.saveDraft(); state.queue?.dispose(); state.uploader?.dispose();
      delete state.queue; delete state.uploader; delete state.owner; delete state.drafts;
      state.submission = createSubmissionState();
      this.setData({ title: '', titleCount: 0, body: '', count: 0, images: [], imagesBusy: false, choosingImages: false,
        submitting: false, universityId: null, universityName: '', notice: '登录已变化，请确认当前账号后继续编辑。' });
    });
  },
  onHide() { this.saveDraft(); },
  onUnload() { const state = composeRuntime(this); this.saveDraft(); state.active = false; state.queue?.dispose(); state.uploader?.dispose(); state.unsubscribe?.(); },
  initializeImages(restore: boolean) {
    const state = composeRuntime(this); const owner = deps.session.getSnapshot().account?.id;
    if (!owner || state.owner === owner) return;
    state.owner = owner; state.drafts = deps.draftStore(); state.uploader = deps.createUploader(owner, deps.session);
    state.queue = new ImageUploadQueue(state.uploader.upload, () => {
      if (!state.active || state.owner !== owner) return;
      this.setData({ images: state.queue?.items.map((item) => ({ ...item })) ?? [], imagesBusy: state.queue?.imageIds() === null }); this.saveDraft();
    });
    const draft = restore ? state.drafts.load(owner) : null;
    if (draft) {
      if (draft.submission) state.submission = draft.submission;
      const index = COMMUNITY_BOARDS.findIndex((board) => board.code === draft.category);
      this.setData({ title: draft.title, titleCount: codePointLength(draft.title), body: draft.body, count: codePointLength(draft.body),
        category: draft.category, categoryIndex: Math.max(0, index), universityId: draft.universityId, universityName: draft.universityName });
      state.queue.restore(draft.images);
    }
  },
  saveDraft() {
    const state = composeRuntime(this);
    if (!state.owner || !state.drafts || state.published) return;
    try { state.drafts.save(state.owner, { title: this.data.title, body: this.data.body, category: this.data.category,
      universityId: this.data.universityId, universityName: this.data.universityName, submission: state.submission,
      images: state.queue?.items.map(({ path, uploaded, uploadedAt }) => ({ path, ...(uploaded ? { uploaded } : {}), ...(uploadedAt ? { uploadedAt } : {}) })) ?? [] }); }
    catch { this.setData({ notice: '草稿未能保存在本机，请勿关闭页面。' }); }
  },
  async addImages() {
    if (this.data.submitting || this.data.choosingImages || this.data.images.length >= 9) return;
    const state = composeRuntime(this); this.setData({ choosingImages: true, notice: '' });
    try {
      if (!canUseCommunityWrite(deps.session.getSnapshot().status)) {
        const auth = await deps.session.ensureAuthenticated(); if (!auth.ok) throw new Error('请先登录后添加图片');
      }
      if (!state.active) return;
      this.initializeImages(false); const owner = state.owner; const queue = state.queue;
      if (!owner || !queue) throw new Error('请先登录后添加图片');
      const paths = await deps.chooseImages(9 - queue.items.length);
      for (const path of paths) {
        if (!state.active || state.queue !== queue || deps.session.getSnapshot().account?.id !== owner) break;
        const saved = await deps.prepareImage(owner, path);
        if (!state.active || state.queue !== queue || deps.session.getSnapshot().account?.id !== owner) { deps.removeImageFile(saved); break; }
        queue.add([saved]);
      }
    } catch { if (state.active) this.setData({ notice: '添加图片失败。请确认已登录、允许照片访问，并选择不超过2000万像素的 JPEG 或 PNG 图片后重试。' }); }
    finally { if (state.active) this.setData({ choosingImages: false }); }
  },
  removeImage(event: WechatMiniprogram.TouchEvent) {
    if (this.data.submitting) return;
    const queue = composeRuntime(this).queue; const item = queue?.items.find((image) => image.key === event.currentTarget.dataset.key);
    if (item && queue) { queue.remove(item.key); deps.removeImageFile(item.path); }
  },
  retryImage(event: WechatMiniprogram.TouchEvent) { if (!this.data.submitting) composeRuntime(this).queue?.retry(event.currentTarget.dataset.key); },
  previewImage(event: WechatMiniprogram.TouchEvent) {
    const images = composeRuntime(this).queue?.items ?? []; const current = images.find((image) => image.key === event.currentTarget.dataset.key);
    if (current) wx.previewImage({ current: current.path, urls: images.map((image) => image.path) });
  },
  discardDraft() {
    if (this.data.submitting) return;
    wx.showModal({ title: '放弃这份草稿？', content: '标题、正文和已选图片将从本机删除。', confirmText: '放弃草稿', success: (result) => {
      if (!result.confirm || !composeRuntime(this).active) return;
      const state = composeRuntime(this); state.queue?.dispose(); state.uploader?.dispose();
      if (state.owner) state.drafts?.clear(state.owner);
      delete state.owner; delete state.queue; state.submission = createSubmissionState();
      this.setData({ title: '', titleCount: 0, body: '', count: 0, images: [], imagesBusy: false, notice: '', category: 'GENERAL', categoryIndex: 0, universityId: null, universityName: '' });
      this.initializeImages(false);
    } });
  },
  updateTitle(event: WechatMiniprogram.Input) { this.setData({ title: event.detail.value, titleCount: codePointLength(event.detail.value), notice: '' }); this.saveDraft(); },
  changeCategory(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value); const board = COMMUNITY_BOARDS[index];
    if (board) { this.setData({ categoryIndex: index, category: board.code, notice: '' }); this.saveDraft(); }
  },
  async openSchools() { this.setData({ schoolOpen: true }); await this.searchSchools(); },
  cancelSchools() { composeRuntime(this).schoolGeneration++; this.setData({ schoolOpen: false, schoolState: 'idle' }); },
  clearSchool() { this.setData({ universityId: null, universityName: '' }); this.saveDraft(); },
  updateSchoolQuery(event: WechatMiniprogram.Input) { this.setData({ schoolQuery: event.detail.value }); },
  async searchSchools() {
    composeRuntime(this).schoolCommittedQuery = this.data.schoolQuery.trim();
    this.setData({ schoolTotalPages: 0 });
    await this.loadSchools(1);
  },
  async retrySchools() { await this.loadSchools(this.data.schoolPage); },
  async nextSchools() { if (this.data.schoolPage < this.data.schoolTotalPages && this.data.schoolState !== 'loading') await this.loadSchools(this.data.schoolPage + 1); },
  async previousSchools() { if (this.data.schoolPage > 1 && this.data.schoolState !== 'loading') await this.loadSchools(this.data.schoolPage - 1); },
  async loadSchools(page: number) {
    const runtime = composeRuntime(this); const generation = ++runtime.schoolGeneration;
    this.setData({ schoolState: 'loading', schoolPage: page, schools: [] });
    const result = await runtime.search({ q: runtime.schoolCommittedQuery, page, size: 12 });
    if (!runtime.active || !this.data.schoolOpen || generation !== runtime.schoolGeneration) return;
    if (!result.ok) { this.setData({ schoolState: 'failed' }); return; }
    const schools = result.value.items.filter((school) => Number.isSafeInteger(school.id) && school.id > 0)
      .map((school) => ({ id: String(school.id), name: school.nameZh }));
    this.setData({ schools, schoolPage: result.value.page, schoolTotalPages: result.value.totalPages, schoolState: schools.length ? 'ready' : 'empty' });
  },
  selectSchool(event: WechatMiniprogram.TouchEvent) {
    const id = event.currentTarget.dataset.id;
    const school = this.data.schools.find((item: { id: string; name: string }) => item.id === id);
    if (school && isCommunityId(id)) { this.setData({ universityId: id, universityName: school.name }); this.cancelSchools(); this.saveDraft(); }
  },
  updateBody(event: WechatMiniprogram.Input) {
    const body = event.detail.value;
    this.setData({ body, count: codePointLength(body), notice: '' });
    this.saveDraft();
  },
  async submit() {
    if (this.data.submitting) return;
    const imageIds = composeRuntime(this).queue?.imageIds() ?? (this.data.images.length ? null : []);
    if (this.data.choosingImages || imageIds === null) { this.setData({ notice: '请等待图片上传完成；失败的图片可重试或移除。' }); return; }
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
    const submittingOwner = deps.session.getSnapshot().account?.id;
    this.setData({ submitting: true, notice: '' });
    if (!canUseCommunityWrite(deps.session.getSnapshot().status)) {
      const auth = await deps.session.ensureAuthenticated();
      if (!state.active) return;
      if (!auth.ok) { this.setData({ submitting: false, notice: submissionErrorCopy(auth.error) }); return; }
    }
    if (!state.active || (submittingOwner !== undefined && submittingOwner !== deps.session.getSnapshot().account?.id)) {
      if (state.active) this.setData({ submitting: false, notice: '登录已变化，请检查内容后重新提交。' });
      return;
    }
    state.submission = prepareSubmission(editSubmission(state.submission, JSON.stringify(['POST', title, body, category, universityId, ...imageIds])), deps.createKey);
    this.saveDraft();
    const result = await deps.createPost({ body, title, category, universityId, ...(imageIds.length ? { imageIds } : {}), idempotencyKey: state.submission.key ?? '' });
    if (!state.active || (submittingOwner !== undefined && submittingOwner !== deps.session.getSnapshot().account?.id)) return;
    if (!result.ok) {
      state.submission = finishSubmission(state.submission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed');
      this.setData({ submitting: false, notice: submissionErrorCopy(result.error) });
      return;
    }
    state.submission = finishSubmission(state.submission, 'completed');
    state.published = true;
    try { if (state.owner) state.drafts?.clear(state.owner); } catch { /* Publication succeeded; local cleanup must not turn it into a retry. */ }
    if (result.value.status === 'PENDING_REVIEW') {
      const automaticImageCheck = imageIds.length > 0;
      this.setData({ notice: automaticImageCheck ? '图片自动检查中，通过后会自动发布。' : PENDING_REVIEW_NOTICE });
      wx.showToast({ title: automaticImageCheck ? '图片检查中' : '已提交审核', icon: 'success' });
      const route = unwrapCommunityRoute(communityMeRoute());
      if (route) wx.redirectTo({ url: `${route}?review=${automaticImageCheck ? 'automatic-image' : 'submitted'}` });
      return;
    }
    wx.showToast({ title: '发布成功', icon: 'success' });
    const route = unwrapCommunityRoute(communityPostRoute(result.value.id));
    if (route) wx.redirectTo({ url: route });
    else this.setData({ submitting: false, notice: '帖子已发布，请返回U圈查看。' });
  },
  };
  return definition;
}

if (typeof Page !== 'undefined') Page(createCircleComposePage());
