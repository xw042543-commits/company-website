"use client";

import { useState } from "react";

function initials(label: string) {
  return label.split(/\s+/).filter(Boolean).slice(0, 3).map(part => part[0]).join("").toUpperCase();
}

export function RemoteImage({
  src,
  alt,
  label,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  label: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={`remote-image-fallback${className ? ` ${className}` : ""}`} aria-label={label}>{initials(label)}</span>;
  }

  return <img
    className={className}
    src={src}
    alt={alt}
    loading={eager ? "eager" : "lazy"}
    onError={() => setFailed(true)}
  />;
}
