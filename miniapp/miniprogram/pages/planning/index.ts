Page({
  data: {
    studyGoals: ['本科', '硕士', '博士', '语言课程'],
    subjectOptions: ['计算机', '商科', '工程', '设计', '医学', '教育', '传媒'],
    selectedGoal: '',
    selectedSubjects: [] as string[],
    country: '',
    intake: '',
  },

  selectGoal(event: WechatMiniprogram.BaseEvent) {
    this.setData({ selectedGoal: String(event.currentTarget.dataset.value ?? '') });
  },

  toggleSubject(event: WechatMiniprogram.BaseEvent) {
    const value = String(event.currentTarget.dataset.value ?? '');
    if (!value) return;
    const selectedSubjects = this.data.selectedSubjects.includes(value)
      ? this.data.selectedSubjects.filter((subject) => subject !== value)
      : [...this.data.selectedSubjects, value];
    this.setData({ selectedSubjects });
  },

  updateCountry(event: WechatMiniprogram.Input) {
    this.setData({ country: event.detail.value });
  },

  updateIntake(event: WechatMiniprogram.Input) {
    this.setData({ intake: event.detail.value });
  },

  continuePlanning() {
    if (!this.data.selectedGoal) {
      wx.showToast({ title: '请先选择留学目标', icon: 'none' });
      return;
    }
    wx.showToast({ title: '学术背景步骤正在建设', icon: 'none' });
  },
});
