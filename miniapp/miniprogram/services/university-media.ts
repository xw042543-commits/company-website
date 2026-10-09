const WEBSITE_ORIGIN = 'https://yangdoujiao.com';

// API identifiers from the website university catalog; media aliases never alter routes.
const API_SLUGS: Readonly<Record<string, string>> = {
  um: 'university-of-malaya', ukm: 'universiti-kebangsaan-malaysia',
  utm: 'universiti-teknologi-malaysia', upm: 'universiti-putra-malaysia',
  usm: 'universiti-sains-malaysia', uum: 'universiti-utara-malaysia',
  taylor: 'taylors-university', ucsi: 'ucsi-university', inti: 'inti-international-university',
  sunway: 'sunway-university', apu: 'asia-pacific-university', segi: 'segi-university',
  utar: 'universiti-tunku-abdul-rahman', city: 'city-university-malaysia',
  monash: 'monash-university-malaysia', nottingham: 'university-of-nottingham-malaysia',
  southampton: 'university-of-southampton-malaysia', help: 'help-university',
  mahsa: 'mahsa-university', nilai: 'nilai-university',
};

const LOGOS: Readonly<Record<string, string>> = {
  'university-of-malaya': 'university-of-malaya.jpg',
  'universiti-kebangsaan-malaysia': 'universiti-kebangsaan-malaysia.jpg',
  'universiti-teknologi-malaysia': 'universiti-teknologi-malaysia.jpg',
  'universiti-putra-malaysia': 'universiti-putra-malaysia.jpg',
  'universiti-sains-malaysia': 'universiti-sains-malaysia.jpg',
  'universiti-utara-malaysia': 'universiti-utara-malaysia.jpg',
  'taylors-university': 'taylors-university.jpg',
  'ucsi-university': 'ucsi-university.jpg',
  'inti-international-university': 'inti-international-university.jpg',
  'sunway-university': 'sunway-university.jpg',
  'asia-pacific-university': 'asia-pacific-university.png',
  'segi-university': 'segi-university.jpg',
  'universiti-tunku-abdul-rahman': 'universiti-tunku-abdul-rahman.png',
  'city-university-malaysia': 'city-university-malaysia.png',
  'monash-university-malaysia': 'monash-university-malaysia.jpg',
  'university-of-nottingham-malaysia': 'university-of-nottingham-malaysia.svg',
  'university-of-southampton-malaysia': 'university-of-southampton-malaysia.png',
  'help-university': 'help-university.png',
  'mahsa-university': 'mahsa-university.png',
  'nilai-university': 'nilai-university.png',
};

const CAMPUS_IMAGES: Readonly<Record<string, string>> = {
  'university-of-malaya': 'um-modern-campus.webp',
  'taylors-university': 'taylors-campus.webp',
  'asia-pacific-university': 'apu-campus.webp',
};

export function universityLogoUrl(slug: string): string | null {
  const filename = LOGOS[API_SLUGS[slug] ?? slug];
  return filename ? `${WEBSITE_ORIGIN}/universities/${filename}` : null;
}

export function universityCampusUrl(slug: string): string | null {
  const filename = CAMPUS_IMAGES[API_SLUGS[slug] ?? slug];
  return filename ? `${WEBSITE_ORIGIN}/universities/campuses/${filename}` : null;
}
