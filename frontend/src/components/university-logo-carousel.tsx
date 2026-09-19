"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UNIVERSITY_CATALOG } from "@/data/university-catalog";
import { Locale, words } from "@/lib/site";

export function UniversityLogoCarousel({ locale }: { locale: Locale }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });

  const updatePosition = () => {
    const track = trackRef.current;
    if (!track) return;
    setPosition({
      start: track.scrollLeft <= 2,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2,
    });
  };

  useEffect(updatePosition, []);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.querySelectorAll<HTMLElement>("a"));
    const item = items[0];
    const itemWidth = item?.offsetWidth || track.clientWidth;
    const visibleItems = Math.max(1, Math.round(track.clientWidth / itemWidth));
    const currentIndex = Math.round(track.scrollLeft / itemWidth);
    const nextIndex = Math.max(0, Math.min(items.length - visibleItems, currentIndex + direction * Math.max(1, visibleItems - 1)));
    items[nextIndex]?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
    window.setTimeout(updatePosition, 50);
  };

  return <div className="university-carousel">
    <div className="carousel-controls" aria-label={words(locale, "院校轮播控制", "University carousel controls")}>
      <button type="button" disabled={position.start} onClick={() => move(-1)} aria-label={words(locale, "查看上一组院校", "Show previous universities")}>
        <span className="carousel-chevron carousel-chevron--previous" aria-hidden="true" />
      </button>
      <button type="button" disabled={position.end} onClick={() => move(1)} aria-label={words(locale, "查看下一组院校", "Show next universities")}>
        <span className="carousel-chevron carousel-chevron--next" aria-hidden="true" />
      </button>
    </div>
    <div ref={trackRef} className="university-logo-track" onScroll={updatePosition}>
      {UNIVERSITY_CATALOG.map((university) => <Link key={university.id} data-logo={university.id} href={`/${locale}/universities/${university.slug}`} aria-label={locale === "zh" ? university.nameZh : university.nameEn}>
        {university.logoSrc ? <Image src={university.logoSrc} width={220} height={110} alt="" /> : <span>{locale === "zh" ? university.nameZh : university.nameEn}</span>}
      </Link>)}
    </div>
  </div>;
}
