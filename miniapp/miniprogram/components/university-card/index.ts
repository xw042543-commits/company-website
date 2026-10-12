Component({
  properties: {
    university: {
      type: Object,
      value: {},
      observer() {
        const university = this.data.university as { imageUrl?: unknown; coverImageUrl?: unknown } | null;
        const coverImageUrl = typeof university?.coverImageUrl === 'string'
          ? university.coverImageUrl.trim() || null : null;
        if (coverImageUrl !== this.data.lastCoverUrl) {
          this.setData({ lastCoverUrl: coverImageUrl, coverFailed: false });
        }
        const imageUrl = typeof university?.imageUrl === 'string'
          ? university.imageUrl.trim() || null : null;
        if (imageUrl !== this.data.lastImageUrl) {
          this.setData({ lastImageUrl: imageUrl, imageFailed: false });
        }
      },
    },
    favorite: { type: Boolean, value: false },
  },
  data: { imageFailed: false, lastImageUrl: null as string | null, coverFailed: false, lastCoverUrl: null as string | null },
  methods: {
    coverError() { this.setData({ coverFailed: true }); },
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
