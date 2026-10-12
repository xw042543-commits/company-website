import { currentRuntimeConfig } from '../../config/runtime';
import type { CommunityImage } from '../../services/community-images';
import { sessionStore } from '../../stores/session';

interface GalleryRuntime { active: boolean; generation: number; unsubscribe: () => void; owner: number | undefined }
const states = new WeakMap<object, GalleryRuntime>();
Component({
  properties: { images: { type: Array, value: [] }, private: { type: Boolean, value: false } },
  data: { tiles: [] as Array<{ id: string; src: string; failed: boolean }>, singleHeight: 360 },
  observers: { 'images, private'() { if (states.has(this)) void this.loadImages(); } },
  lifetimes: {
    attached() {
      const state: GalleryRuntime = { active: true, generation: 0, owner: sessionStore.getSnapshot().account?.id, unsubscribe: () => {} };
      states.set(this, state);
      state.unsubscribe = sessionStore.subscribe(() => {
        if (this.data.private && state.owner !== sessionStore.getSnapshot().account?.id) {
          state.generation++; this.setData({ tiles: [] });
        }
      });
      void this.loadImages();
    },
    detached() { const state = states.get(this); if (state) { state.active = false; state.generation++; state.unsubscribe(); } states.delete(this); },
  },
  methods: {
    async loadImages() {
      const state = states.get(this); if (!state?.active) return;
      const generation = ++state.generation;
      if (this.data.private && (!state.owner || state.owner !== sessionStore.getSnapshot().account?.id)) { this.setData({ tiles: [] }); return; }
      const images = this.data.images as CommunityImage[];
      const first = images[0];
      this.setData({ tiles: images.map((image) => ({ id: image.id, src: '', failed: false })),
        singleHeight: first ? Math.max(220, Math.min(650, 600 * first.height / first.width)) : 360 });
      await Promise.all(images.map(async (image, index) => {
        let src = ''; let failed = false;
        try {
          const url = `${currentRuntimeConfig().apiOrigin}${image.thumbnailUrl}`;
          src = this.data.private ? await this.download(url) : url;
        } catch { failed = true; }
        if (!state.active || generation !== state.generation) return;
        this.setData({ [`tiles[${index}]`]: { id: image.id, src, failed } });
      }));
    },
    download(url: string): Promise<string> {
      const token = sessionStore.getAccessToken();
      if (!token) return Promise.reject(new Error('Login required'));
      return new Promise((resolve, reject) => wx.downloadFile({ url, header: { Authorization: `Bearer ${token}` }, timeout: 15000,
        success: (response) => response.statusCode === 200 ? resolve(response.tempFilePath) : reject(new Error('Image unavailable')),
        fail: () => reject(new Error('Image unavailable')) }));
    },
    imageError(event: WechatMiniprogram.BaseEvent) { const index = Number(event.currentTarget.dataset.index); if (Number.isInteger(index) && this.data.tiles[index]) this.setData({ [`tiles[${index}].failed`]: true }); },
    retry() { void this.loadImages(); },
    async preview(event: WechatMiniprogram.BaseEvent) {
      const state = states.get(this); if (!state?.active) return;
      const generation = state.generation;
      const image = (this.data.images as CommunityImage[]).find((item) => item.id === event.currentTarget.dataset.id);
      if (!image) return;
      try {
        const url = `${currentRuntimeConfig().apiOrigin}${image.url}`;
        const current = this.data.private ? await this.download(url) : url;
        if (!state.active || generation !== state.generation) return;
        wx.previewImage({ current, urls: this.data.private ? [current] : (this.data.images as CommunityImage[]).map((item) => `${currentRuntimeConfig().apiOrigin}${item.url}`) });
      } catch { if (state.active) wx.showToast({ title: '图片暂时无法查看，请重试', icon: 'none' }); }
    },
  },
});
