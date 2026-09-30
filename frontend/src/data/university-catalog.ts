export type ProgrammeStatus = "pending" | "available";

export type UniversityCatalogEntry = {
  id: string;
  slug: string;
  apiSlug: string;
  nameZh: string;
  nameEn: string;
  countryZh: string;
  countryEn: string;
  countryCode: string;
  continentCode: string;
  cityZh: string;
  cityEn: string;
  logoSrc?: string;
  aliases: string[];
  programmeStatus: ProgrammeStatus;
};

export const UNIVERSITY_CATALOG: UniversityCatalogEntry[] = [
  { id: "um", slug: "university-of-malaya", apiSlug: "um", nameZh: "马来亚大学", nameEn: "University of Malaya", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/university-of-malaya.jpg", aliases: ["UM", "Universiti Malaya", "马大"], programmeStatus: "available" },
  { id: "ukm", slug: "universiti-kebangsaan-malaysia", apiSlug: "ukm", nameZh: "马来西亚国民大学", nameEn: "Universiti Kebangsaan Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "万宜", cityEn: "Bangi", logoSrc: "/universities/universiti-kebangsaan-malaysia.jpg", aliases: ["UKM", "National University of Malaysia", "国民大学"], programmeStatus: "available" },
  { id: "utm", slug: "universiti-teknologi-malaysia", apiSlug: "utm", nameZh: "马来西亚理工大学", nameEn: "Universiti Teknologi Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "新山", cityEn: "Johor Bahru", logoSrc: "/universities/universiti-teknologi-malaysia.jpg", aliases: ["UTM", "University of Technology Malaysia", "理工大学"], programmeStatus: "available" },
  { id: "upm", slug: "universiti-putra-malaysia", apiSlug: "upm", nameZh: "马来西亚博特拉大学", nameEn: "Universiti Putra Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "沙登", cityEn: "Serdang", logoSrc: "/universities/universiti-putra-malaysia.jpg", aliases: ["UPM", "Putra University Malaysia", "博特拉大学"], programmeStatus: "available" },
  { id: "usm", slug: "universiti-sains-malaysia", apiSlug: "usm", nameZh: "马来西亚理科大学", nameEn: "Universiti Sains Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "槟城", cityEn: "Penang", logoSrc: "/universities/universiti-sains-malaysia.jpg", aliases: ["USM", "University of Science Malaysia", "理科大学"], programmeStatus: "available" },
  { id: "uum", slug: "universiti-utara-malaysia", apiSlug: "uum", nameZh: "马来西亚北方大学", nameEn: "Universiti Utara Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉打州新笃", cityEn: "Sintok, Kedah", logoSrc: "/universities/universiti-utara-malaysia.jpg", aliases: ["UUM", "Northern University of Malaysia", "北方大学"], programmeStatus: "available" },
  { id: "taylors", slug: "taylors-university", apiSlug: "taylor", nameZh: "泰莱大学", nameEn: "Taylor's University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "梳邦再也", cityEn: "Subang Jaya", logoSrc: "/universities/taylors-university.jpg", aliases: ["Taylor", "Taylors", "泰莱"], programmeStatus: "available" },
  { id: "ucsi", slug: "ucsi-university", apiSlug: "ucsi", nameZh: "思特雅大学", nameEn: "UCSI University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/ucsi-university.jpg", aliases: ["UCSI", "思特雅"], programmeStatus: "available" },
  { id: "inti", slug: "inti-international-university", apiSlug: "inti", nameZh: "英迪国际大学", nameEn: "INTI International University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "汝来", cityEn: "Nilai", logoSrc: "/universities/inti-international-university.jpg", aliases: ["INTI", "英迪大学", "英迪"], programmeStatus: "available" },
  { id: "sunway", slug: "sunway-university", apiSlug: "sunway", nameZh: "双威大学", nameEn: "Sunway University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "双威城", cityEn: "Bandar Sunway", logoSrc: "/universities/sunway-university.jpg", aliases: ["Sunway", "双威"], programmeStatus: "available" },
  { id: "apu", slug: "asia-pacific-university", apiSlug: "apu", nameZh: "亚太科技大学", nameEn: "Asia Pacific University of Technology & Innovation", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/asia-pacific-university.png", aliases: ["APU", "Asia Pacific University", "亚太大学", "亚太科技"], programmeStatus: "available" },
  { id: "segi", slug: "segi-university", apiSlug: "segi", nameZh: "世纪大学", nameEn: "SEGi University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "哥打白沙罗", cityEn: "Kota Damansara", logoSrc: "/universities/segi-university.jpg", aliases: ["SEGi", "SEGI", "世纪"], programmeStatus: "available" },
  { id: "utar", slug: "universiti-tunku-abdul-rahman", apiSlug: "utar", nameZh: "拉曼大学", nameEn: "Universiti Tunku Abdul Rahman", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "金宝与双溪龙", cityEn: "Kampar and Sungai Long", logoSrc: "/universities/universiti-tunku-abdul-rahman.png", aliases: ["UTAR", "Tunku Abdul Rahman University", "拉曼"], programmeStatus: "available" },
  { id: "city", slug: "city-university-malaysia", apiSlug: "city", nameZh: "马来西亚城市大学", nameEn: "City University Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "八打灵再也", cityEn: "Petaling Jaya", logoSrc: "/universities/city-university-malaysia.png", aliases: ["City University", "CityU", "城市大学"], programmeStatus: "available" },
  { id: "monash", slug: "monash-university-malaysia", apiSlug: "monash", nameZh: "莫纳什大学马来西亚分校", nameEn: "Monash University Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "双威城", cityEn: "Bandar Sunway", logoSrc: "/universities/monash-university-malaysia.jpg", aliases: ["Monash", "莫纳什", "蒙纳士大学马来西亚分校"], programmeStatus: "available" },
  { id: "nottingham", slug: "university-of-nottingham-malaysia", apiSlug: "nottingham", nameZh: "诺丁汉大学马来西亚分校", nameEn: "University of Nottingham Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "士毛月", cityEn: "Semenyih", logoSrc: "/universities/university-of-nottingham-malaysia.svg", aliases: ["Nottingham", "UNM", "诺丁汉"], programmeStatus: "available" },
  { id: "southampton", slug: "university-of-southampton-malaysia", apiSlug: "southampton", nameZh: "南安普顿大学马来西亚分校", nameEn: "University of Southampton Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "依斯干达公主城", cityEn: "Iskandar Puteri", logoSrc: "/universities/university-of-southampton-malaysia.png", aliases: ["Southampton", "UoSM", "南安普顿"], programmeStatus: "available" },
  { id: "help", slug: "help-university", apiSlug: "help", nameZh: "精英大学", nameEn: "HELP University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "莎阿南", cityEn: "Shah Alam", logoSrc: "/universities/help-university.png", aliases: ["HELP", "HELP University Malaysia", "精英"], programmeStatus: "available" },
  { id: "mahsa", slug: "mahsa-university", apiSlug: "mahsa", nameZh: "玛莎大学", nameEn: "MAHSA University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "仁嘉隆", cityEn: "Jenjarom", logoSrc: "/universities/mahsa-university.png", aliases: ["MAHSA", "玛莎"], programmeStatus: "available" },
  { id: "nilai", slug: "nilai-university", apiSlug: "nilai", nameZh: "汝来大学", nameEn: "Nilai University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "汝来", cityEn: "Nilai", logoSrc: "/universities/nilai-university.png", aliases: ["Nilai", "汝来"], programmeStatus: "available" },
];

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en");
}

export function searchUniversityCatalog(query: string): UniversityCatalogEntry[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return UNIVERSITY_CATALOG;

  const searchableValues = (university: UniversityCatalogEntry) => [
    university.nameZh,
    university.nameEn,
    university.countryZh,
    university.countryEn,
    university.cityZh,
    university.cityEn,
    ...university.aliases,
  ].map(normalizeSearchText);

  const exactMatches = UNIVERSITY_CATALOG.filter((university) =>
    searchableValues(university).some((value) => value === normalizedQuery),
  );
  if (exactMatches.length) return exactMatches;

  return UNIVERSITY_CATALOG.filter((university) =>
    searchableValues(university).some((value) => value.includes(normalizedQuery)),
  );
}

export function filterUniversityCatalog(query: string, countryCode = "", continentCode = ""): UniversityCatalogEntry[] {
  const normalizedCountry = countryCode.trim().toUpperCase();
  const normalizedContinent = continentCode.trim().toUpperCase();

  return searchUniversityCatalog(query).filter((university) =>
    (!normalizedCountry || university.countryCode === normalizedCountry) &&
    (!normalizedContinent || university.continentCode === normalizedContinent),
  );
}



export function findUniversityBySlug(slug: string) {
  return UNIVERSITY_CATALOG.find((university) => university.slug === slug || university.apiSlug === slug);
}

export function backendUniversitySlug(slug: string) {
  return findUniversityBySlug(slug)?.apiSlug ?? slug;
}

export function localizeUniversity(university: UniversityCatalogEntry, locale: "zh" | "en") {
  return locale === "zh"
    ? { name: university.nameZh, secondaryName: university.nameEn, country: university.countryZh, city: university.cityZh }
    : { name: university.nameEn, secondaryName: university.nameZh, country: university.countryEn, city: university.cityEn };
}
