"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const easing = "cubic-bezier(0.23, 1, 0.32, 1)";
    const pageAnimation = main.animate(
      [{ opacity: 0.78, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 260, easing, fill: "both" },
    );
    const revealTargets = Array.from(main.querySelectorAll<HTMLElement>(
      ":scope > section, :scope > .section, :scope > .listing-layout, .listing-layout > section, .detail-layout > section",
    ));
    const revealAnimations = new Map<Element, Animation>();
    revealTargets.forEach((element, index) => {
      const animation = element.animate(
        [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 520, delay: Math.min(index, 5) * 35, easing, fill: "both" },
      );
      animation.pause();
      revealAnimations.set(element, animation);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealAnimations.get(entry.target)?.play();
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    revealTargets.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      pageAnimation.cancel();
      revealAnimations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}
