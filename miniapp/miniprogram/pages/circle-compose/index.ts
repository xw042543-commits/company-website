import { createCommunityPost, createSubmissionKey } from '../../services/community';
import { sessionStore } from '../../stores/session';
import { canUseCommunityWrite, codePointLength, createSubmissionState, editSubmission, errorCopy, finishSubmission, prepareSubmission, unwrapCommunityRoute, type SubmissionState } from '../../utils/community-ui';
import { communityMeRoute, communityPostRoute } from '../../utils/routes';

let submission: SubmissionState = createSubmissionState();

Page({
  data: { body: '', count: 0, submitting: false, notice: '' },
  onLoad() { submission = createSubmissionState(); },
  updateBody(event: WechatMiniprogram.Input) {
    const body = event.detail.value;
    submission = editSubmission(submission, body);
    this.setData({ body, count: codePointLength(body), notice: '' });
  },
  async submit() {
    if (this.data.submitting) return;
    if (!canUseCommunityWrite(sessionStore.getSnapshot().status)) {
      const auth = await sessionStore.ensureAuthenticated();
      if (!auth.ok) { this.setData({ notice: '请先完成微信登录后再发布。' }); return; }
    }
    const body = this.data.body.trim();
    const count = codePointLength(body);
    if (count < 1 || count > 2000) { this.setData({ notice: '帖子正文需为1至2000个字。' }); return; }
    submission = prepareSubmission(editSubmission(submission, body), createSubmissionKey);
    this.setData({ submitting: true, notice: '' });
    const result = await createCommunityPost({ body, idempotencyKey: submission.key ?? '' });
    if (!result.ok) {
      submission = finishSubmission(submission, result.error.kind === 'unavailable' ? 'uncertain' : result.error.kind === 'unauthorized' ? 'authentication' : 'completed');
      this.setData({ submitting: false, notice: errorCopy(result.error) });
      return;
    }
    submission = finishSubmission(submission, 'completed');
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
});
