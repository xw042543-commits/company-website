import { currentRuntimeConfig } from '../config/runtime';
import { sessionStore } from '../stores/session';
import type { UploadedImage } from '../utils/community-image-queue';
import { request } from './http';

export interface CommunityImage extends UploadedImage { url: string; thumbnailUrl: string }
export async function fetchCommunityImages(postIds: readonly string[], authenticated = false, send = request): Promise<Record<string, CommunityImage[]>> {
  const ids = [...new Set(postIds)];
  if (!ids.length || ids.length > 50 || ids.some((id) => !/^[1-9]\d*$/.test(id))) return {};
  try {
    const result = await send<unknown>({ method: 'GET', path: `/api/v1/community/images?postIds=${ids.join(',')}`, authenticated });
    if (!result.ok || !result.value || typeof result.value !== 'object' || Array.isArray(result.value)) return {};
    const output: Record<string, CommunityImage[]> = {};
    for (const [postId, images] of Object.entries(result.value)) {
      if (!ids.includes(postId) || !Array.isArray(images) || images.length > 9) return {};
      for (const item of images) {
        if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !/^[0-9a-f]{32}$/.test(item.id)
          || !Number.isInteger(item.width) || item.width < 1 || item.width > 1600
          || !Number.isInteger(item.height) || item.height < 1 || item.height > 1600
          || item.url !== `/api/v1/community/images/${item.id}` || item.thumbnailUrl !== `${item.url}?thumbnail=true`) return {};
      }
      output[postId] = images;
    }
    return output;
  } catch { return {}; }
}

interface UploadSession {
  getSnapshot(): { account?: { id: number } | null };
  getAccessToken(): string | null;
  refresh(): Promise<{ ok: boolean }>;
  subscribe(listener: () => void): () => void;
}
type UploadTransport = (path: string, token: string) => Promise<{ statusCode: number; data: string }>;
const nativeUpload: UploadTransport = (filePath, token) => new Promise((resolve, reject) => {
  wx.uploadFile({ url: `${currentRuntimeConfig().apiOrigin}/api/v1/community/images`, name: 'file', filePath,
    header: { Authorization: `Bearer ${token}` }, timeout: 30000, success: resolve,
    fail: () => reject(new Error('图片上传失败，请检查网络后重试')) });
});
export function createImageUploader(owner: number, session: UploadSession = sessionStore, transport: UploadTransport = nativeUpload) {
  let active = true;
  const unsubscribe = session.subscribe(() => { if (session.getSnapshot().account?.id !== owner) active = false; });
  const check = () => { if (!active || session.getSnapshot().account?.id !== owner) throw new Error('登录已变化，请重新打开发布页'); };
  return {
    dispose() { active = false; unsubscribe(); },
    async upload(path: string): Promise<UploadedImage> {
      for (let attempt = 0; attempt < 2; attempt++) {
        check();
        let token = session.getAccessToken();
        if (!token) { await session.refresh(); check(); token = session.getAccessToken(); }
        if (!token) throw new Error('请重新登录后上传');
        const response = await transport(path, token); check();
        if (response.statusCode === 401 && attempt === 0) { await session.refresh(); check(); continue; }
        if (response.statusCode === 507) throw new Error('图片空间暂时不足，请稍后重试');
        if (response.statusCode === 429) throw new Error('上传较多或服务繁忙，请稍后再试');
        if (response.statusCode < 200 || response.statusCode >= 300) throw new Error('图片上传失败，请重试');
        let value: unknown;
        try { value = JSON.parse(response.data); } catch { throw new Error('图片上传结果异常，请重试'); }
        if (!value || typeof value !== 'object') throw new Error('图片上传结果异常，请重试');
        const image = value as Record<string, unknown>;
        if (typeof image.id !== 'string' || !/^[0-9a-f]{32}$/.test(image.id) || image.status !== 'PENDING'
          || typeof image.width !== 'number' || !Number.isInteger(image.width) || image.width < 1 || image.width > 1600
          || typeof image.height !== 'number' || !Number.isInteger(image.height) || image.height < 1 || image.height > 1600)
          throw new Error('图片上传结果异常，请重试');
        return { id: image.id, width: image.width, height: image.height };
      }
      throw new Error('登录已过期，请重新登录');
    },
  };
}
