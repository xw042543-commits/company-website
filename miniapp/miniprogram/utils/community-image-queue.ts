export interface UploadedImage { id: string; width: number; height: number }
export interface DraftImage {
  key: string; path: string; status: 'queued' | 'uploading' | 'ready' | 'failed';
  uploaded?: UploadedImage; uploadedAt?: number;
}
/** At most two requests; removal/disposal invalidates late completions by item identity. */
export class ImageUploadQueue {
  items: DraftImage[] = [];
  private running = 0;
  private active = true;
  private sequence = 0;
  constructor(private readonly upload: (path: string) => Promise<UploadedImage>, private readonly changed: () => void) {}
  restore(saved: { path: string; uploaded?: UploadedImage; uploadedAt?: number }[]): void {
    if (this.items.length || saved.length > 9) throw new Error('Invalid image draft');
    this.items = saved.map((item) => ({ ...item, key: `image-${++this.sequence}`,
      status: item.uploaded && item.uploadedAt && Date.now() - item.uploadedAt < 23 * 3600000 && Date.now() >= item.uploadedAt ? 'ready' : 'queued' }));
    this.changed(); this.pump();
  }
  add(paths: string[]): void {
    if (!this.active || this.items.length + paths.length > 9) throw new Error('最多添加9张图片');
    this.items.push(...paths.map((path): DraftImage => ({ key: `image-${++this.sequence}`, path, status: 'queued' })));
    this.changed(); this.pump();
  }
  remove(key: string): void { this.items = this.items.filter((item) => item.key !== key); this.changed(); this.pump(); }
  retry(key: string): void {
    const item = this.items.find((entry) => entry.key === key);
    if (item?.status === 'failed') { item.status = 'queued'; this.pump(); }
  }
  imageIds(): string[] | null {
    return this.items.every((item) => item.status === 'ready' && item.uploaded)
      ? this.items.map((item) => item.uploaded!.id) : null;
  }
  dispose(): void { this.active = false; }
  private pump(): void {
    if (!this.active) return;
    while (this.running < 2) {
      const item = this.items.find((entry) => entry.status === 'queued');
      if (!item) return;
      item.status = 'uploading'; this.running++; this.changed();
      void this.upload(item.path).then((uploaded) => {
        if (!this.active || !this.items.includes(item)) return;
        item.uploaded = uploaded; item.uploadedAt = Date.now(); item.status = 'ready';
      }).catch(() => {
        if (this.active && this.items.includes(item)) item.status = 'failed';
      }).finally(() => {
        this.running--;
        if (this.active) { this.changed(); this.pump(); }
      });
    }
  }
}
