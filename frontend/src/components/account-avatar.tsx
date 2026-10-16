"use client";
import Image from "next/image";
import { useState } from "react";
export function AccountAvatar({ name, url, size = 40, className }: { name: string; url?: string | null; size?: number; className?: string }) {
  return <AvatarImage key={url || "none"} name={name} url={url} size={size} className={className} />;
}
function AvatarImage({ name, url, size, className }: { name: string; url?: string | null; size: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, borderRadius: "50%", objectFit: "cover" as const, flexShrink: 0 };
  return url && !failed ? <Image unoptimized className={className} src={url} width={size} height={size} alt={`${name}的头像`} style={style} onError={() => setFailed(true)} />
    : <span className={className} style={{ ...style, display: "inline-grid", placeItems: "center", background: "#e4f0e9", color: "#215c49", fontWeight: 700 }} aria-label={`${name}的默认头像`}>{Array.from(name.trim())[0] || "用"}</span>;
}
