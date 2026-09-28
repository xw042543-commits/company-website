import records from "./local-programmes.generated.json" with { type: "json" };

export type LocalProgrammeRecord = {
  universityId: string; level: "bachelor" | "master" | "doctorate"; nameZh: string; nameEn: string; facultyZh: string; facultyEn: string; academicRequirement: string; englishRequirement: string; duration: string; registrationFee: string; tuition: string; intakes: string; mode: string; interview: string;
};

export const LOCAL_PROGRAMMES = records as LocalProgrammeRecord[];
