"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { UNIVERSITY_CATALOG } from "@/data/university-catalog";
import { FEATURED_UNIVERSITY_IDS, universityProfile } from "@/data/university-profiles";
import { LocationLabel } from "@/components/location-label";
import { Locale, words } from "@/lib/site";

const featured = FEATURED_UNIVERSITY_IDS.map((id) => UNIVERSITY_CATALOG.find((item) => item.id === id)).filter(Boolean);

export function FeaturedUniversityCarousel({ locale }: { locale: Locale }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });

  const updatePosition = () => {
    const track = trackRef.current;
    if (!track) return;
    setPosition({ start: track.scrollLeft <= 2, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
  };

  useEffect(updatePosition, []);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
    window.setTimeout(updatePosition, 350);
  };

  return <div className="featured-carousel">
    <div className="featured-carousel-controls" aria-label={words(locale, "精选院校轮播控制", "Featured university carousel controls")}>
      <span aria-live="polite">{words(locale, "每页显示三所院校", "Three universities per screen")}</span>
      <div>
        <button type="button" disabled={position.start} onClick={() => move(-1)} aria-label={words(locale, "上一组院校", "Previous universities")}><span className="carousel-chevron carousel-chevron--previous" aria-hidden="true" /></button>
        <button type="button" disabled={position.end} onClick={() => move(1)} aria-label={words(locale, "下一组院校", "Next universities")}><span className="carousel-chevron carousel-chevron--next" aria-hidden="true" /></button>
      </div>
    </div>
    <div ref={trackRef} className="featured-university-track" onScroll={updatePosition}>
      {featured.map((university) => {
        if (!university) return null;
        const profile = universityProfile(university.id);
        const name = locale === "zh" ? university.nameZh : university.nameEn;
        const city = locale === "zh" ? university.cityZh : university.cityEn;
        const subjects = locale === "zh" ? profile.subjectsZh : profile.subjectsEn;
        const intakes = locale === "zh" ? profile.intakesZh : profile.intakesEn;
        return <article className="featured-university-card" key={university.id}>
          <div className={`featured-university-media${profile.campusImageSrc ? " has-photo" : ""}`}>
            {profile.campusImageSrc
              ? <Image src={profile.campusImageSrc} fill sizes="(max-width: 760px) 86vw, 33vw" alt={words(locale, `${name} 校园`, `${name} campus`)} />
              : university.logoSrc && <Image className="featured-university-logo" src={university.logoSrc} width={280} height={150} alt={words(locale, `${name} 标志`, `${name} logo`)} />}
          </div>
          <div className="featured-university-content">
            <p className="featured-university-location"><LocationLabel city={city} country={locale === "zh" ? university.countryZh : university.countryEn} locale={locale} /></p>
            <h3>{name}</h3>
            <p className="featured-university-intro">{locale === "zh" ? profile.introductionZh : profile.introductionEn}</p>
            <dl className="featured-university-facts">
              <div><dt>{words(locale, "热门方向", "Popular subjects")}</dt><dd>{subjects.join(" · ")}</dd></div>
              <div><dt>{words(locale, "入学时间", "Intake periods")}</dt><dd>{intakes}</dd></div>
            </dl>
            <Link className="button full-width" href={`/${locale}/universities/${university.slug}`}>{words(locale, "查看院校", "View university")}</Link>
          </div>
        </article>;
      })}
    </div>
    <p className="featured-image-credit">{words(locale, "校园照片来源：院校官网及已标注的开放授权来源。", "Campus imagery: official university sources and credited open-licence sources.")}</p>
  </div>;
}
