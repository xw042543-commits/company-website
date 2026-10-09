Component({
  properties: {
    university: {
      type: Object,
      value: {},
      observer() {
        const university = this.data.university as { coverImageUrl?: string | null; imageUrl?: string | null } | null;
        const imageUrl = university?.coverImageUrl ?? university?.imageUrl ?? null;
        if (imageUrl !== this.data.displayImageUrl) {
          this.setData({ displayImageUrl: imageUrl, imageFailed: false });
        }
      },
    },
    favorite: { type: Boolean, value: false },
  },
  data: { imageFailed: false, displayImageUrl: null as string | null },
  methods: {
    imageError() { this.setData({ imageFailed: true }); },
    select() {
      const university = this.data.university as { slug?: unknown };
      this.triggerEvent('select', { slug: typeof university.slug === 'string' ? university.slug : undefined });
    },
    toggleFavorite() {
      const university = this.data.university as { slug?: unknown };
      this.triggerEvent('favorite', { slug: typeof university.slug === 'string' ? university.slug : undefined });
    },
  },
});
