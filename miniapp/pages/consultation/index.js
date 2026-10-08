const api = require('../../utils/api')
const storage = require('../../utils/storage')
const { requireLogin } = require('../../utils/session')

Page({
  data: { form: { name: '', contact: '', school: '', course: '', qualification: 'bachelor', notes: '' }, consent: false, submitting: false, error: '', referenceCode: '' },
  onLoad(query) {
    if (!requireLogin(`/pages/consultation/index?school=${encodeURIComponent(query.school || '')}&course=${encodeURIComponent(query.course || '')}`)) return
    const session = getApp().globalData.session
    this.setData({ 'form.name': session.fullName || '', 'form.school': query.school || '', 'form.course': query.course || '' })
  },
  input(event) { this.setData({ [`form.${event.currentTarget.dataset.field}`]: event.detail.value }) },
  chooseQualification(event) { this.setData({ 'form.qualification': event.currentTarget.dataset.value }) },
  consent(event) { this.setData({ consent: event.detail.value.length > 0 }) },
  async submit() {
    const form = this.data.form
    if (!form.name.trim() || !form.contact.trim()) return this.setData({ error: '请填写姓名和联系方式。' })
    if (!this.data.consent) return this.setData({ error: '请先同意隐私政策与咨询信息处理说明。' })
    this.setData({ submitting: true, error: '' })
    try {
      const result = await api.write('/api/v1/consultations', {
        name: form.name.trim(), contact: form.contact.trim(), intendedSchool: form.school.trim() || null,
        intendedCourse: form.course.trim() || null, qualification: form.qualification,
        notes: form.notes.trim() || null, locale: 'zh', privacyConsent: true
      })
      const record = { id: result.referenceCode, referenceCode: result.referenceCode, submittedAt: result.submittedAt,
        school: form.school, course: form.course, status: '已提交' }
      storage.upsert('consultations', record, 'referenceCode')
      this.setData({ submitting: false, referenceCode: result.referenceCode })
    } catch (error) {
      this.setData({ submitting: false, error: api.errorMessage(error) })
    }
  },
  viewRecords() { wx.navigateTo({ url: '/pages/consultations/index' }) }
})
