export type SourceDefinition = {
  sourceKey: string;
  displayName: string;
  seedUrls: string[];
  allowedHosts: string[];
  countryRaw: string | null;
};

export type CrawlerConfig = {
  userAgent: string;
  requestDelayMs: number;
  maxPagesPerSource: number;
  sources: SourceDefinition[];
};

export type Evidence = {
  sourceUrl: string;
  fetchedAt: string;
  field: string;
  rawText: string;
};

export type ProgrammeCandidate = {
  candidateId: string;
  programmeCode: null;
  universityCode: null;
  nameZh: string | null;
  nameEn: string | null;
  subjectCategoryCode: null;
  subjectCategoryRaw: string | null;
  studyLevelCode: null;
  studyLevelRaw: string | null;
  courseModeCode: null;
  courseModeRaw: string | null;
  durationDisplay: string | null;
  durationMonths: number | null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  status: "DRAFT";
  tuition: {
    min: number | null;
    max: number | null;
    currency: string | null;
    display: string | null;
    feePeriod: "UNKNOWN";
    rmbMin: null;
    rmbMax: null;
    exchangeRate: null;
    exchangeRateDate: null;
    totalRmbMin: null;
    totalRmbMax: null;
  };
  languages: Array<{ code: null; rawText: string }>;
  intakes: Array<{ displayText: string; date: string | null }>;
  evidence: Evidence[];
};

export type UniversityCandidate = {
  candidateId: string;
  universityCode: null;
  nameZh: string | null;
  nameEn: string | null;
  countryCode: null;
  countryRaw: string | null;
  cityZh: null;
  cityEn: null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  popular: null;
  status: "DRAFT";
  campusRaw: null;
  officialWebsite: string;
  logoSourceUrl: string | null;
  logoLicenceRaw: null;
  partnerInstitution: null;
  partnershipStatementRaw: null;
  lastCheckedAt: string;
  reviewer: null;
  evidence: Evidence[];
};

export type PageSnapshot = {
  url: string;
  fetchedAt: string;
  status: number;
  contentType: string;
  sha256: string;
  title: string | null;
  html: string;
};

export type ReviewBundle = {
  schemaVersion: "1.0";
  generatedAt: string;
  sourceKey: string;
  sourceName: string;
  warnings: string[];
  university: UniversityCandidate | null;
  programmes: ProgrammeCandidate[];
  pages: Array<Omit<PageSnapshot, "html"> & { snapshotFile: string }>;
};
