Component({
  properties: {
    university: {
      type: Object,
      value: {},
      observer() { this.setData({ imageFailed: false }); },
    },
  },
  data: { imageFailed: false },
  methods: {
    imageError() { this.setData({ imageFailed: true }); },
    select() {
      const university = this.data.university as { slug?: unknown };
      this.triggerEvent('select', { slug: typeof university.slug === 'string' ? university.slug : undefined });
    },
  },
});
