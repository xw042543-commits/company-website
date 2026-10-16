export const MAX_AVATAR_BYTES = 1_048_576;
export const AVATAR_SIZE_ERROR = "头像大小不能超过1MB";
export const AVATAR_FORMAT_ERROR = "请选择真实有效的JPG、PNG或WebP图片";
export function validateAvatarSize(size: number) {
  if (size > MAX_AVATAR_BYTES) throw new Error(AVATAR_SIZE_ERROR);
  if (!Number.isFinite(size) || size <= 0) throw new Error(AVATAR_FORMAT_ERROR);
}
export function avatarMime(bytes: Uint8Array) {
  const starts = (signature: number[]) => signature.every((value, i) => bytes[i] === value);
  if (starts([255, 216, 255])) return "image/jpeg";
  if (starts([137, 80, 78, 71, 13, 10, 26, 10])) return "image/png";
  if (bytes.length >= 12 && starts([82, 73, 70, 70]) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  throw new Error(AVATAR_FORMAT_ERROR);
}
export async function readAvatarFile(file: File): Promise<{ image: HTMLImageElement; dispose: () => void }> {
  validateAvatarSize(file.size);
  const type = avatarMime(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!/\.(jpe?g|png|webp)$/i.test(file.name) || file.type.toLowerCase() !== type) throw new Error(AVATAR_FORMAT_ERROR);
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 8192 || image.naturalHeight > 8192 || image.naturalWidth * image.naturalHeight > 32_000_000)
      throw new Error("图片分辨率过大，请先缩小图片");
    return { image, dispose: () => URL.revokeObjectURL(url) };
  } catch (error) { URL.revokeObjectURL(url); throw new Error(error instanceof Error && error.message === "图片分辨率过大，请先缩小图片" ? error.message : AVATAR_FORMAT_ERROR); }
}
export function squareCrop(width: number, height: number, zoom = 1, horizontal = .5, vertical = .5) {
  const side = Math.min(width, height) / Math.max(1, Math.min(3, zoom));
  return { x: (width - side) * Math.max(0, Math.min(1, horizontal)), y: (height - side) * Math.max(0, Math.min(1, vertical)), side };
}
export async function compressAvatar(encode: (quality: number) => Promise<Blob | null>): Promise<Blob> {
  for (const quality of [.9, .8, .7, .6, .5, .4]) {
    const blob = await encode(quality);
    if (!blob || blob.type !== "image/jpeg") throw new Error("图片处理失败，请重新选择图片");
    if (blob.size > 0 && blob.size <= MAX_AVATAR_BYTES) return blob;
  }
  throw new Error("图片压缩失败，请缩小裁剪范围后重试");
}
export function avatarBase64(blob: Blob): Promise<string> {
  validateAvatarSize(blob.size);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("图片读取失败，请重试"));
    reader.readAsDataURL(blob);
  });
}
