interface ImagePreparation {
  info(path: string): Promise<{ type: string; width: number; height: number }>;
  compress(path: string, width: number, quality: number): Promise<string>;
  size(path: string): Promise<number>;
  persist(owner: number, path: string): Promise<string>;
}
const native: ImagePreparation = {
  info: (src) => new Promise((resolve, reject) => wx.getImageInfo({ src, success: resolve, fail: () => reject(new Error('无法读取这张图片，请重新选择')) })),
  compress: (src, compressedWidth, quality) => new Promise((resolve, reject) => wx.compressImage({ src, compressedWidth, quality,
    success: (result) => resolve(result.tempFilePath), fail: () => reject(new Error('图片压缩失败，请重新选择')) })),
  size: (filePath) => new Promise((resolve, reject) => wx.getFileSystemManager().getFileInfo({ filePath,
    success: (result) => resolve(result.size), fail: () => reject(new Error('无法读取图片文件')) })),
  persist: async (owner, path) => {
    const fs = wx.getFileSystemManager(); const directory = `${wx.env.USER_DATA_PATH}/community-drafts/${owner}`;
    try { fs.accessSync(directory); } catch { fs.mkdirSync(directory, true); }
    const target = `${directory}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    await new Promise<void>((resolve, reject) => fs.copyFile({ srcPath: path, destPath: target,
      success: () => resolve(), fail: () => reject(new Error('本地空间不足，无法保存图片草稿')) }));
    return target;
  },
};
export async function prepareDraftImage(owner: number, path: string, platform: ImagePreparation = native): Promise<string> {
  if (!Number.isSafeInteger(owner) || owner < 1) throw new Error('请先登录');
  const info = await platform.info(path);
  if (!['jpeg', 'jpg', 'png'].includes(info.type.toLowerCase())) throw new Error('请选择 JPEG 或 PNG 静态图片');
  if (info.width < 1 || info.height < 1 || info.width * info.height > 20000000) throw new Error('图片像素过大，请裁剪后重新选择');
  let result = path; let size = Infinity;
  for (const quality of [80, 60, 40]) {
    const width = Math.max(1, Math.round(info.width * Math.min(1, 1600 / Math.max(info.width, info.height))));
    result = await platform.compress(path, width, quality); size = await platform.size(result);
    if (size <= 1024 * 1024) break;
  }
  if (size > 5 * 1024 * 1024) throw new Error('压缩后仍超过5MB，请裁剪后重新选择');
  return platform.persist(owner, result);
}
export function chooseDraftImages(count: number): Promise<string[]> {
  return new Promise((resolve, reject) => wx.chooseMedia({ count, mediaType: ['image'], sourceType: ['album', 'camera'], sizeType: ['compressed'],
    success: (result) => resolve(result.tempFiles.map((file) => file.tempFilePath)),
    fail: (error) => /cancel/i.test(error.errMsg) ? resolve([]) : reject(new Error('无法打开相册，请在微信权限设置中允许访问照片或相机')) }));
}
