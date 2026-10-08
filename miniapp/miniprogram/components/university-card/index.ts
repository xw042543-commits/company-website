Component({
  properties: {
    university: { type: Object, value: {} },
  },
  methods: {
    select() {
      const university = this.data.university as { slug?: unknown };
      this.triggerEvent('select', { slug: typeof university.slug === 'string' ? university.slug : undefined });
    },
  },
});
