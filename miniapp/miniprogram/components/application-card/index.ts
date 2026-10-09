Component({
  properties: { application: { type: Object, value: {} }, compact: { type: Boolean, value: false } },
  data: { imageFailed: false },
  observers: { 'application.logo': function () { this.setData({ imageFailed: false }); } },
  methods: { imageError() { this.setData({ imageFailed: true }); } },
});
