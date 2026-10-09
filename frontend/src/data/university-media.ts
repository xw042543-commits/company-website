export type UniversityMedia = {
  logoSrc?: string;
  sourceUrl: string;
  assetUrl: string;
  checkedAt: string;
};

const UNIVERSITY_MEDIA: Record<string, UniversityMedia> = {
  "local-preview-sp-jain-singapore": {
    logoSrc: "/universities/sp-jain-singapore-logo.jpg",
    sourceUrl: "https://www.spjain.sg/",
    assetUrl: "https://www.spjain.sg/hubfs/home2017/sp-jain-mobile-logo.jpg",
    checkedAt: "2026-10-08",
  },
};

export function universityMedia(slug: string): UniversityMedia | undefined {
  return UNIVERSITY_MEDIA[slug];
}
