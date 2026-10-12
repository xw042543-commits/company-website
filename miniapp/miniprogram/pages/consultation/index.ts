import { consultationGateway, type ConsultationDraft, type Qualification } from '../../services/consultations';
import { sessionStore } from '../../stores/session';

const qualifications: Array<{ label: string; value: Qualification }> = [
  { label: '尚未确定', value: '' }, { label: '预科', value: 'foundation' },
  { label: '本科', value: 'bachelor' }, { label: '硕士', value: 'master' }, { label: '博士', value: 'doctorate' },
];

Page({
  data: {
    form: { name: '', contact: '', intendedSchool: '', intendedCourse: '', qualification: '', notes: '', privacyConsent: false } as ConsultationDraft,
    qualifications, qualificationIndex: 0, qualificationLabel: '尚未确定', submitting: false, receipt: '',
  },
  onLoad(options: Record<string, string | undefined>) {
    try {
      const qualification = decode(options.qualification);
      const qualificationIndex = Math.max(0, qualifications.findIndex((item) => item.value === qualification));
      const account = sessionStore.getSnapshot().account;
      this.setData({ qualificationIndex, qualificationLabel: qualifications[qualificationIndex]?.label ?? '尚未确定', form: { ...this.data.form,
        name: account?.displayName === '微信用户' ? '' : account?.displayName ?? '',
        intendedSchool: decode(options.school), intendedCourse: decode(options.course),
        qualification: qualifications[qualificationIndex]?.value ?? '',
      } });
    } catch { wx.showToast({ title: '咨询资料无法读取', icon: 'none' }); }
  },
  updateField(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as keyof ConsultationDraft;
    if (!['name', 'contact', 'notes'].includes(field)) return;
    this.setData({ form: { ...this.data.form, [field]: event.detail.value } });
  },
  selectQualification(event: WechatMiniprogram.PickerChange) {
    const qualificationIndex = Number(event.detail.value);
    this.setData({ qualificationIndex, qualificationLabel: qualifications[qualificationIndex]?.label ?? '尚未确定', form: { ...this.data.form,
      qualification: qualifications[qualificationIndex]?.value ?? '' } });
  },
  consentChanged(event: WechatMiniprogram.CheckboxGroupChange) {
    this.setData({ form: { ...this.data.form, privacyConsent: event.detail.value.includes('accepted') } });
  },
  async submit() {
    if (this.data.submitting) return;
    const form = this.data.form;
    if (!form.name.trim() || !form.contact.trim()) { wx.showToast({ title: '请填写姓名和联系方式', icon: 'none' }); return; }
    if (!form.privacyConsent) { wx.showToast({ title: '请先同意隐私说明', icon: 'none' }); return; }
    this.setData({ submitting: true });
    const auth = await sessionStore.ensureAuthenticated();
    if (!auth.ok) { this.setData({ submitting: false }); wx.showToast({ title: '请先完成微信登录', icon: 'none' }); return; }
    wx.showLoading({ title: '正在提交', mask: true });
    const result = await consultationGateway.submit(form);
    wx.hideLoading();
    this.setData({ submitting: false });
    if (!result.ok) { wx.showToast({ title: result.error.kind === 'rate-limited' ? '提交较频繁，请稍后再试' : '提交失败，请稍后重试', icon: 'none' }); return; }
    this.setData({ receipt: result.value.referenceCode });
  },
  openRecords() { wx.redirectTo({ url: '/pages/consultations/index' }); },
  back() { wx.navigateBack(); },
});

function decode(value: string | undefined): string { return value ? decodeURIComponent(value).trim() : ''; }
