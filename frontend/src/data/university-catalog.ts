export type ProgrammeStatus = "pending" | "available";

export type UniversityCatalogEntry = {
  id: string;
  slug: string;
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
  { id: "um", slug: "university-of-malaya", nameZh: "马来亚大学", nameEn: "University of Malaya", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/university-of-malaya.jpg", aliases: ["UM", "Universiti Malaya", "马大"], programmeStatus: "pending" },
  { id: "ukm", slug: "universiti-kebangsaan-malaysia", nameZh: "马来西亚国民大学", nameEn: "Universiti Kebangsaan Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "万宜", cityEn: "Bangi", logoSrc: "/universities/universiti-kebangsaan-malaysia.jpg", aliases: ["UKM", "National University of Malaysia", "国民大学"], programmeStatus: "pending" },
  { id: "utm", slug: "universiti-teknologi-malaysia", nameZh: "马来西亚理工大学", nameEn: "Universiti Teknologi Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "新山", cityEn: "Johor Bahru", logoSrc: "/universities/universiti-teknologi-malaysia.jpg", aliases: ["UTM", "University of Technology Malaysia", "理工大学"], programmeStatus: "pending" },
  { id: "upm", slug: "universiti-putra-malaysia", nameZh: "马来西亚博特拉大学", nameEn: "Universiti Putra Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "沙登", cityEn: "Serdang", logoSrc: "/universities/universiti-putra-malaysia.jpg", aliases: ["UPM", "Putra University Malaysia", "博特拉大学"], programmeStatus: "pending" },
  { id: "usm", slug: "universiti-sains-malaysia", nameZh: "马来西亚理科大学", nameEn: "Universiti Sains Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "槟城", cityEn: "Penang", logoSrc: "/universities/universiti-sains-malaysia.jpg", aliases: ["USM", "University of Science Malaysia", "理科大学"], programmeStatus: "pending" },
  { id: "uum", slug: "universiti-utara-malaysia", nameZh: "马来西亚北方大学", nameEn: "Universiti Utara Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉打州新笃", cityEn: "Sintok, Kedah", logoSrc: "/universities/universiti-utara-malaysia.jpg", aliases: ["UUM", "Northern University of Malaysia", "北方大学"], programmeStatus: "pending" },
  { id: "taylors", slug: "taylors-university", nameZh: "泰莱大学", nameEn: "Taylor's University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "梳邦再也", cityEn: "Subang Jaya", logoSrc: "/universities/taylors-university.jpg", aliases: ["Taylor", "Taylors", "泰莱"], programmeStatus: "pending" },
  { id: "ucsi", slug: "ucsi-university", nameZh: "思特雅大学", nameEn: "UCSI University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/ucsi-university.jpg", aliases: ["UCSI", "思特雅"], programmeStatus: "pending" },
  { id: "inti", slug: "inti-international-university", nameZh: "英迪国际大学", nameEn: "INTI International University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "汝来", cityEn: "Nilai", logoSrc: "/universities/inti-international-university.jpg", aliases: ["INTI", "英迪大学", "英迪"], programmeStatus: "pending" },
  { id: "sunway", slug: "sunway-university", nameZh: "双威大学", nameEn: "Sunway University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "双威城", cityEn: "Bandar Sunway", logoSrc: "/universities/sunway-university.jpg", aliases: ["Sunway", "双威"], programmeStatus: "pending" },
  { id: "apu", slug: "asia-pacific-university", nameZh: "亚太科技大学", nameEn: "Asia Pacific University of Technology & Innovation", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/asia-pacific-university.jpg", aliases: ["APU", "Asia Pacific University", "亚太大学", "亚太科技"], programmeStatus: "pending" },
  { id: "segi", slug: "segi-university", nameZh: "世纪大学", nameEn: "SEGi University", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "哥打白沙罗", cityEn: "Kota Damansara", logoSrc: "/universities/segi-university.jpg", aliases: ["SEGi", "SEGI", "世纪"], programmeStatus: "pending" },
  { id: "utar", slug: "universiti-tunku-abdul-rahman", nameZh: "拉曼大学", nameEn: "Universiti Tunku Abdul Rahman", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "金宝与双溪龙", cityEn: "Kampar and Sungai Long", aliases: ["UTAR", "Tunku Abdul Rahman University", "拉曼"], programmeStatus: "pending" },
  { id: "tar-umt", slug: "tunku-abdul-rahman-university-of-management-and-technology", nameZh: "拉曼理工大学", nameEn: "Tunku Abdul Rahman University of Management and Technology", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "吉隆坡", cityEn: "Kuala Lumpur", logoSrc: "/universities/tar-umt.png", aliases: ["TAR UMT", "TARUMT", "拉曼理工"], programmeStatus: "pending" },
  { id: "monash", slug: "monash-university-malaysia", nameZh: "莫纳什大学马来西亚分校", nameEn: "Monash University Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "双威城", cityEn: "Bandar Sunway", logoSrc: "/universities/monash-university-malaysia.jpg", aliases: ["Monash", "莫纳什", "蒙纳士大学马来西亚分校"], programmeStatus: "pending" },
  { id: "nottingham", slug: "university-of-nottingham-malaysia", nameZh: "诺丁汉大学马来西亚分校", nameEn: "University of Nottingham Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "士毛月", cityEn: "Semenyih", logoSrc: "/universities/university-of-nottingham-malaysia.svg", aliases: ["Nottingham", "UNM", "诺丁汉"], programmeStatus: "pending" },
  { id: "southampton", slug: "university-of-southampton-malaysia", nameZh: "南安普顿大学马来西亚分校", nameEn: "University of Southampton Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "依斯干达公主城", cityEn: "Iskandar Puteri", logoSrc: "/universities/university-of-southampton-malaysia.png", aliases: ["Southampton", "UoSM", "南安普顿"], programmeStatus: "pending" },
  { id: "heriot-watt", slug: "heriot-watt-university-malaysia", nameZh: "赫瑞-瓦特大学马来西亚分校", nameEn: "Heriot-Watt University Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "布城", cityEn: "Putrajaya", logoSrc: "/universities/heriot-watt-university-malaysia.png", aliases: ["Heriot-Watt", "HWUM", "赫瑞瓦特", "赫瑞-瓦特"], programmeStatus: "pending" },
  { id: "curtin", slug: "curtin-university-malaysia", nameZh: "科廷大学马来西亚分校", nameEn: "Curtin University Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "砂拉越美里", cityEn: "Miri, Sarawak", logoSrc: "/universities/curtin-university-malaysia.png", aliases: ["Curtin", "Curtin Malaysia", "科廷"], programmeStatus: "pending" },
  { id: "reading", slug: "university-of-reading-malaysia", nameZh: "雷丁大学马来西亚分校", nameEn: "University of Reading Malaysia", countryZh: "马来西亚", countryEn: "Malaysia", countryCode: "MY", continentCode: "AS", cityZh: "依斯干达公主城", cityEn: "Iskandar Puteri", logoSrc: "/universities/university-of-reading-malaysia.png", aliases: ["Reading", "UoRM", "雷丁"], programmeStatus: "pending" },
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
  return UNIVERSITY_CATALOG.find((university) => university.slug === slug);
}

export function localizeUniversity(university: UniversityCatalogEntry, locale: "zh" | "en") {
  return locale === "zh"
    ? { name: university.nameZh, secondaryName: university.nameEn, country: university.countryZh, city: university.cityZh }
    : { name: university.nameEn, secondaryName: university.nameZh, country: university.countryEn, city: university.cityEn };
}
