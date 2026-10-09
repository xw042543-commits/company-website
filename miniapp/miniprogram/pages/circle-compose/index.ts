import { createCommunityPost, createSubmissionKey } from '../../services/community';
import { sessionStore } from '../../stores/session';
import { canUseCommunityWrite, codePointLength, createSubmissionState, editSubmission, errorCopy, finishSubmission, prepareSubmission, unwrapCommunityRoute, type SubmissionState } from '../../utils/community-ui';
import { communityMeRoute, communityPostRoute } from '../../utils/routes';

interface ComposeRuntime { submission: SubmissionState; active: boolean }
type ComposeDeps = { createPost: typeof createCommunityPost; createKey: typeof createSubmissionKey; session: typeof sessionStore };
const composeDefaults: ComposeDeps = { createPost: createCommunityPost, createKey: createSubmissionKey, session: sessionStore };
type ComposePage = WechatMiniprogram.Page.TrivialInstance & { _communityRuntime: ComposeRuntime };
function composeRuntime(page: WechatMiniprogram.Page.TrivialInstance): ComposeRuntime { return (page as ComposePage)._communityRuntime; }

export function createCircleComposePage(overrides: Partial<ComposeDeps> = {}): WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> {
  const deps = { ...composeDefaults, ...overrides };
  const definition: WechatMiniprogram.Page.Options<WechatMiniprogram.IAnyObject, WechatMiniprogram.IAnyObject> = {
  data: { body: '', count: 0, submitting: false, notice: '' },
  onLoad() { (this as ComposePage)._communityRuntime = { submission: createSubmissionState(), active: true }; },
  onUnload() { composeRuntime(this).active = false; },
  updateBody(event: WechatMiniprogram.Input) {
    const body = event.detail.value;
    this.setData({ body, count: codePointLength(body), notice: '' });
  },
  async submit() {
    if (this.data.submitting) return;
    if (!canUseCommunityWrite(deps.session.getSnapshot().status)) {
      const auth = await deps.session.ensureAuthenticated();
      if (!auth.ok) { this.setData({ notice: '请先完成微信登录后再发布。' }); return; }
    }
    const body = this.data.body.trim();
    const count = codePointLength(body);
    if (count < 1 || count > 2000) { this.setData({ notice: '帖子正文需为1至2000个字。' }); return; }
    const state = composeRuntime(this);
    state.submission = prepareSubmission(editSubmission(state.submission, `POST\u0000${body}`), deps.createKey);
    this.setData({ submitting: true, notice: '' });
    const result = await deps.createPost({ body, idempotencyKey: state.submission.key ?? '' });
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
