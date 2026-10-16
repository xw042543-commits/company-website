import assert from "node:assert/strict";
import test from "node:test";
import { AVATAR_SIZE_ERROR, avatarMime, compressAvatar, MAX_AVATAR_BYTES, readAvatarFile, squareCrop, validateAvatarSize } from "./avatar-image.ts";
import { isSafeProfileAvatar } from "./profile-sync.ts";

test("accepts exactly 1MB and rejects one byte over before reading or uploading", async () => {
  assert.doesNotThrow(() => validateAvatarSize(MAX_AVATAR_BYTES));
  assert.throws(() => validateAvatarSize(MAX_AVATAR_BYTES + 1), new Error(AVATAR_SIZE_ERROR));
  await assert.rejects(readAvatarFile(new File([new Uint8Array(MAX_AVATAR_BYTES + 1)], "big.png", { type: "image/png" })), new Error(AVATAR_SIZE_ERROR));
  assert.throws(() => validateAvatarSize(0));
});
test("uses image bytes and rejects disguised files and MIME mismatches", async () => {
  assert.equal(avatarMime(new Uint8Array([255, 216, 255])), "image/jpeg");
  assert.equal(avatarMime(new Uint8Array([137,80,78,71,13,10,26,10])), "image/png");
  assert.equal(avatarMime(new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80])), "image/webp");
  assert.throws(() => avatarMime(new TextEncoder().encode("<svg/>")));
  await assert.rejects(readAvatarFile(new File([new Uint8Array([137,80,78,71,13,10,26,10])], "fake.jpg", { type: "image/jpeg" })));
});
test("square crop keeps pixels in bounds for wide tall and zoomed images", () => {
  assert.deepEqual(squareCrop(800,400), { x:200,y:0,side:400 });
  assert.deepEqual(squareCrop(400,800), { x:0,y:200,side:400 });
  assert.deepEqual(squareCrop(800,400,2,1,1), { x:600,y:200,side:200 });
  assert.deepEqual(squareCrop(800,400,0,-1,2), { x:0,y:0,side:400 });
});
test("compression retries lower quality and accepts an exact-size result", async () => {
  const qualities: number[] = [];
  const blob = await compressAvatar(async quality => {
    qualities.push(quality);
    return new Blob([new Uint8Array(MAX_AVATAR_BYTES + (quality > .8 ? 1 : 0))], { type: "image/jpeg" });
  });
  assert.deepEqual(qualities,[.9,.8]);
  assert.equal(blob.size,MAX_AVATAR_BYTES);
});
test("failed or oversized compression never returns an uploadable result", async () => {
  await assert.rejects(compressAvatar(async () => null));
  await assert.rejects(compressAvatar(async () => new Blob(["x"], {type:"text/html"})));
  await assert.rejects(compressAvatar(async () => new Blob([new Uint8Array(MAX_AVATAR_BYTES + 1)], {type:"image/jpeg"})));
});
test("profile images accept owned versioned storage and WeChat but no arbitrary domains", () => {
  assert.equal(isSafeProfileAvatar("/api/v1/miniapp/avatars/7?v=new-version"),true);
  assert.equal(isSafeProfileAvatar("https://yangdoujiao.com/api/v1/miniapp/avatars/7?v=new-version"),true);
  assert.equal(isSafeProfileAvatar("https://thirdwx.qlogo.cn/mmopen/photo/132"),true);
  for(const url of ["javascript:alert(1)","https://evil.test/photo.jpg","https://yangdoujiao.com/not-avatar?v=x","/api/v1/miniapp/avatars/7?v=x#fragment"])
    assert.equal(isSafeProfileAvatar(url),false,url);
});
