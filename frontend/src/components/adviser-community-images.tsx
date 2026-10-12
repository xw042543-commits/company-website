"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { readCommunityImages, type CommunityImage } from "@/lib/community-image-data";

export function AdviserCommunityImages({ postId }: { postId: string }) {
  const [result, setResult] = useState<{ images: CommunityImage[]; failed: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/v1/community/images?postIds=${encodeURIComponent(postId)}`, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error('Unavailable'); return readCommunityImages(await response.json(), postId); })
      .then((images) => { if (!controller.signal.aborted) setResult({ images, failed: false }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ images: [], failed: true }); });
    return () => controller.abort();
  }, [postId, attempt]);
  if (!result) return <p role="status">正在读取附件…</p>;
  if (result.failed) return <p role="alert">图片未能完整加载，请先核对附件再审核。<button type="button" className="secondary" onClick={() => { setResult(null); setAttempt((value) => value + 1); }}>重新加载图片</button></p>;
  if (!result.images.length) return null;
  return <div className="community-review-images" aria-label="帖子图片">{result.images.map((image, index) =>
    <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" aria-label={`打开第${index + 1}张图片原图`}>
      <Image unoptimized src={image.thumbnailUrl} alt={`帖子附件 ${index + 1}`} width={image.width} height={image.height}
        onError={() => setResult({ images: [], failed: true })} style={{ width: "100%", height: "auto", maxHeight: 300, objectFit: "contain" }} />
    </a>)}</div>;
}
