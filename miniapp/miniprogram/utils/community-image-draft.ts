import { isCommunityCategory } from './community-boards';
import { isCommunityId } from './community-validation';
import type { UploadedImage } from './community-image-queue';
import type { SubmissionState } from './community-ui';

export interface ImageDraft {
  title: string; body: string; category: string; universityId: string | null; universityName: string;
  images: { path: string; uploaded?: UploadedImage; uploadedAt?: number }[];
  submission?: SubmissionState;
}
interface DraftStorage { get(key: string): unknown; set(key: string, value: unknown): void; remove(key: string): void }
export function createImageDraftStore(root: string, storage: DraftStorage, removeFile: (path: string) => void) {
  const key = (owner: number) => `udajo.community.draft.v1.${owner}`;
  const valid = (owner: number, input: unknown): input is ImageDraft => {
    if (!Number.isSafeInteger(owner) || owner < 1 || !input || typeof input !== 'object') return false;
    const draft = input as ImageDraft;
    return typeof draft.title === 'string' && [...draft.title].length <= 60 && typeof draft.body === 'string' && [...draft.body].length <= 2000
      && isCommunityCategory(draft.category) && (draft.universityId === null || isCommunityId(draft.universityId))
      && typeof draft.universityName === 'string' && draft.universityName.length <= 255
      && (draft.submission === undefined || (typeof draft.submission.body === 'string' && draft.submission.body.length <= 10000
        && (draft.submission.key === null || /^[A-Za-z0-9._:-]{1,64}$/.test(draft.submission.key)) && typeof draft.submission.completed === 'boolean'))
      && Array.isArray(draft.images) && draft.images.length <= 9 && draft.images.every((image) => {
        if (!image || typeof image.path !== 'string') return false;
        const prefix = `${root}/community-drafts/${owner}/`;
        return image.path.startsWith(prefix) && /^[a-zA-Z0-9-]+\.jpg$/.test(image.path.slice(prefix.length))
          && (image.uploadedAt === undefined || (Number.isFinite(image.uploadedAt) && image.uploadedAt > 0))
          && (image.uploaded === undefined || (typeof image.uploaded.id === 'string' && /^[0-9a-f]{32}$/.test(image.uploaded.id)
            && Number.isInteger(image.uploaded.width) && image.uploaded.width > 0 && image.uploaded.width <= 1600
            && Number.isInteger(image.uploaded.height) && image.uploaded.height > 0 && image.uploaded.height <= 1600));
      });
  };
  const load = (owner: number): ImageDraft | null => {
    try { const value = storage.get(key(owner)); return valid(owner, value) ? value : null; } catch { return null; }
  };
  return {
    load,
    save(owner: number, draft: ImageDraft) { if (!valid(owner, draft)) throw new Error('Invalid image draft'); storage.set(key(owner), draft); },
    clear(owner: number) {
      const draft = load(owner); storage.remove(key(owner));
      draft?.images.forEach((image) => removeFile(image.path));
    },
  };
}
export function nativeImageDraftStore() {
  return createImageDraftStore(wx.env.USER_DATA_PATH, {
    get: (key) => wx.getStorageSync(key), set: (key, value) => wx.setStorageSync(key, value), remove: (key) => wx.removeStorageSync(key),
  }, removeDraftFile);
}
export function removeDraftFile(path: string): void {
  const prefix = `${wx.env.USER_DATA_PATH}/community-drafts/`;
  if (!path.startsWith(prefix) || !/^\d+\/[a-zA-Z0-9-]+\.jpg$/.test(path.slice(prefix.length))) return;
  try { wx.getFileSystemManager().unlinkSync(path); } catch { /* Already removed. */ }
}
