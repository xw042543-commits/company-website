import Image from "next/image";
import { type Locale } from "@/lib/site";

const inferredCountryCodes: Array<[RegExp, string]> = [
  [/malaysia|马来西亚/i, "MY"],
  [/united kingdom|英国/i, "GB"],
  [/united states|美国/i, "US"],
  [/australia|澳大利亚|澳洲/i, "AU"],
  [/singapore|新加坡/i, "SG"],
];

const flagCodes = new Set(["AU", "GB", "MY", "SG", "US"]);

export function LocationLabel({ city, country, countryCode, locale }: { city?: string; country: string; countryCode?: string; locale: Locale }) {
  const code = countryCode?.trim().toUpperCase()
    || inferredCountryCodes.find(([pattern]) => pattern.test(country))?.[1]
    || "";
  const flag = flagCodes.has(code);
  return <span className="location-label">
    <svg className="location-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12A7 7 0 1 0 5 9c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.25" /></svg>
    <span>{city ? `${city}, ` : ""}{country}</span>
    {flag
      ? <Image className="country-flag country-flag-image" src={`/flags/${code.toLowerCase()}.svg`} width={24} height={16} alt={`${country} ${locale === "zh" ? "国旗" : "flag"}`} />
      : <span className="country-code" aria-hidden="true">{locale === "zh" ? "国际" : "INTL"}</span>}
  </span>;
}
