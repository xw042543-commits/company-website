"use client";

import { useState } from "react";

function initials(label: string) {
  return label.split(/\s+/).filter(Boolean).slice(0, 3).map(part => part[0]).join("").toUpperCase();
}

type RemoteImageProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
  eager?: boolean;
};

export function RemoteImage(props: RemoteImageProps) {
  // A new URL owns a fresh failure state; stale events stay on the old instance.
  return <RemoteImageContent key={props.src} {...props} />;
}

function RemoteImageContent({
  src,
  alt,
  label,
  className,
  eager = false,
}: RemoteImageProps) {
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
