import { Locale } from "@/lib/site";

function MalaysiaFlag() {
  return <svg className="country-flag" viewBox="0 0 28 18" aria-hidden="true">
    <rect width="28" height="18" rx="2" fill="#fff" />
    {[0, 4, 8, 12, 16].map((y) => <rect key={y} y={y} width="28" height="2" fill="#c9343a" />)}
    <path fill="#16356c" d="M0 0h13v10H0z" />
    <circle cx="6.3" cy="5" r="3.2" fill="#f4c430" /><circle cx="7.5" cy="4.3" r="2.7" fill="#16356c" /><circle cx="9.8" cy="5" r="1" fill="#f4c430" />
  </svg>;
}

export function LocationLabel({ city, country, locale }: { city?: string; country: string; locale: Locale }) {
  const isMalaysia = /malaysia|马来西亚/i.test(country);
  return <span className="location-label">
    <svg className="location-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12A7 7 0 1 0 5 9c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.25" /></svg>
    <span>{city ? `${city}, ` : ""}{country}</span>
    {isMalaysia && <MalaysiaFlag />}
    {!isMalaysia && <span className="country-code" aria-hidden="true">{locale === "zh" ? "国际" : "INTL"}</span>}
  </span>;
}
