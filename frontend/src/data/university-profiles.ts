export type UniversityProfile = {
  introductionZh: string;
  introductionEn: string;
  subjectsZh: string[];
  subjectsEn: string[];
  intakesZh: string;
  intakesEn: string;
  tuitionZh: string;
  tuitionEn: string;
  rankingZh: string;
  rankingEn: string;
  academicRequirementsZh: string;
  academicRequirementsEn: string;
  languageRequirementsZh: string;
  languageRequirementsEn: string;
  campusImageSrc?: string;
  imageCredit?: { label: string; href: string };
};

const publicIntake = { intakesZh: "主要年度入学，部分研究生课程有不同安排", intakesEn: "Main annual intake; postgraduate schedules may vary" };
const privateIntake = { intakesZh: "每年多次入学，视课程而定", intakesEn: "Multiple intakes each year, depending on programme" };
const branchIntake = { intakesZh: "通常有多个入学月份，视课程而定", intakesEn: "Several intake periods, depending on programme" };
const publicFees = { tuitionZh: "公立大学学费按课程及学生身份而定，请索取最新费用表", tuitionEn: "Public university fees vary by programme and student status; request the current fee schedule" };
const privateFees = { tuitionZh: "私立大学学费按课程及入学时间而定，请索取最新费用表", tuitionEn: "Private tuition varies by programme and intake; request the current fee schedule" };
const branchFees = { tuitionZh: "分校学费按课程及入学时间而定，请索取最新费用表", tuitionEn: "Branch-campus tuition varies by programme and intake; request the current fee schedule" };
const standardEntry = {
  academicRequirementsZh: "按所选课程及申请学历审核；具体成绩与先修科目要求正在逐项整理",
  academicRequirementsEn: "Assessed by programme and prior qualification; detailed grade and prerequisite requirements are being compiled",
  languageRequirementsZh: "英语要求按课程而定；具体 IELTS 或大学认可的同等成绩正在逐项整理",
  languageRequirementsEn: "English requirements vary by programme; accepted IELTS or equivalent scores are being compiled",
};
const ranking = (value: string) => ({ rankingZh: value, rankingEn: value });
const pendingRanking = { rankingZh: "最新排名资料正在审核", rankingEn: "Latest ranking information under review" };
const globalRanking = (nameZh: string, nameEn: string) => ({
  rankingZh: `请参考${nameZh}全球排名`,
  rankingEn: `Refer to ${nameEn}'s global ranking`,
});

export const UNIVERSITY_PROFILES: Record<string, UniversityProfile> = {
  um: { introductionZh: "马来亚大学是位于吉隆坡的综合研究型公立大学，课程覆盖人文、科学、工程、商业与医学。", introductionEn: "University of Malaya is a comprehensive public research university in Kuala Lumpur, with programmes spanning the humanities, sciences, engineering, business, and medicine.", subjectsZh: ["工程", "商业", "医学"], subjectsEn: ["Engineering", "Business", "Medicine"], ...publicIntake, ...publicFees, ...ranking("QS World 2027: #56"), ...standardEntry, campusImageSrc: "/universities/campuses/um-modern-campus.webp" },
  ukm: { introductionZh: "马来西亚国民大学是一所位于万宜的公立研究型大学，提供广泛的本科及研究生课程。", introductionEn: "Universiti Kebangsaan Malaysia is a public research university in Bangi offering a broad range of undergraduate and postgraduate programmes.", subjectsZh: ["医学", "工程", "社会科学"], subjectsEn: ["Medicine", "Engineering", "Social sciences"], ...publicIntake, ...publicFees, ...ranking("QS World 2027: #130"), ...standardEntry },
  utm: { introductionZh: "马来西亚理工大学以工程、科技及建筑环境课程见长，主校区位于新山。", introductionEn: "Universiti Teknologi Malaysia is known for engineering, technology, and the built environment, with its main campus in Johor Bahru.", subjectsZh: ["工程", "计算机", "建筑"], subjectsEn: ["Engineering", "Computing", "Architecture"], ...publicIntake, ...publicFees, ...ranking("QS World 2027: =158"), ...standardEntry },
  upm: { introductionZh: "马来西亚博特拉大学位于沙登，由农业教育传统发展为综合研究型大学。", introductionEn: "Universiti Putra Malaysia is a comprehensive research university in Serdang with roots in agricultural education.", subjectsZh: ["农业", "兽医学", "商业"], subjectsEn: ["Agriculture", "Veterinary science", "Business"], ...publicIntake, ...publicFees, ...ranking("QS World 2027: #138"), ...standardEntry },
  usm: { introductionZh: "马来西亚理科大学是以科学、健康、工程及可持续发展研究著称的公立研究型大学。", introductionEn: "Universiti Sains Malaysia is a public research university recognised for science, health, engineering, and sustainability research.", subjectsZh: ["科学", "药剂学", "工程"], subjectsEn: ["Science", "Pharmacy", "Engineering"], ...publicIntake, ...publicFees, ...ranking("QS World 2027: =128"), ...standardEntry },
  uum: { introductionZh: "马来西亚北方大学位于吉打州新笃，课程重点包括管理、商业及公共事务。", introductionEn: "Universiti Utara Malaysia is based in Sintok, Kedah, with a strong focus on management, business, and public affairs.", subjectsZh: ["管理", "会计", "公共管理"], subjectsEn: ["Management", "Accounting", "Public administration"], ...publicIntake, ...publicFees, ...pendingRanking, ...standardEntry },
  taylors: { introductionZh: "泰莱大学的湖畔校区位于梳邦再也，提供酒店管理、商业、设计、计算机及健康科学等课程。", introductionEn: "Taylor's University is based at a lakeside campus in Subang Jaya and offers programmes in hospitality, business, design, computing, and health sciences.", subjectsZh: ["酒店管理", "商业", "设计"], subjectsEn: ["Hospitality", "Business", "Design"], ...privateIntake, ...privateFees, ...ranking("QS World 2027: #272"), ...standardEntry, campusImageSrc: "/universities/campuses/taylors-campus.webp", imageCredit: { label: "Taylor's University campus", href: "https://university.taylors.edu.my/en/discover-us/about-taylors/leaderships-and-governance.html" } },
  ucsi: { introductionZh: "思特雅大学在吉隆坡设有主要校区，课程涵盖音乐、商业、工程、药剂及健康科学。", introductionEn: "UCSI University's main campus is in Kuala Lumpur, offering programmes in music, business, engineering, pharmacy, and health sciences.", subjectsZh: ["音乐", "药剂学", "工程"], subjectsEn: ["Music", "Pharmacy", "Engineering"], ...privateIntake, ...privateFees, ...ranking("QS World 2027: #282"), ...standardEntry },
  inti: { introductionZh: "英迪国际大学位于汝来，提供商业、计算机、工程及衔接海外大学的学习选择。", introductionEn: "INTI International University is based in Nilai and offers programmes in business, computing, and engineering, alongside international pathway options.", subjectsZh: ["商业", "计算机", "工程"], subjectsEn: ["Business", "Computing", "Engineering"], ...privateIntake, ...privateFees, ...ranking("QS World 2027: =406"), ...standardEntry },
  sunway: { introductionZh: "双威大学位于双威城，课程涵盖商业、酒店管理、计算机、心理学及健康科学。", introductionEn: "Sunway University is located in Bandar Sunway and offers programmes in business, hospitality, computing, psychology, and health sciences.", subjectsZh: ["商业", "酒店管理", "心理学"], subjectsEn: ["Business", "Hospitality", "Psychology"], ...privateIntake, ...privateFees, ...ranking("QS World 2027: =354"), ...standardEntry },
  apu: { introductionZh: "亚太科技大学位于吉隆坡科技园区，以计算机、科技、工程、商业及创意课程为重点。", introductionEn: "Asia Pacific University is based in Kuala Lumpur's technology park and focuses on computing, technology, engineering, business, and creative programmes.", subjectsZh: ["计算机", "网络安全", "商业"], subjectsEn: ["Computing", "Cybersecurity", "Business"], ...privateIntake, ...privateFees, ...ranking("QS World 2027: =528"), ...standardEntry, campusImageSrc: "/universities/campuses/apu-campus.webp", imageCredit: { label: "APU official campus guide", href: "https://apu.edu.my/node/514" } },
  segi: { introductionZh: "世纪大学主校区位于哥打白沙罗，提供商业、工程、健康科学及教育等课程。", introductionEn: "SEGi University's main campus is in Kota Damansara, offering programmes in business, engineering, health sciences, and education.", subjectsZh: ["商业", "健康科学", "教育"], subjectsEn: ["Business", "Health sciences", "Education"], ...privateIntake, ...privateFees, ...pendingRanking, ...standardEntry },
  utar: { introductionZh: "拉曼大学在金宝与双溪龙设有校区，提供工程、商业、科学、医学及人文课程。", introductionEn: "Universiti Tunku Abdul Rahman has campuses in Kampar and Sungai Long, offering programmes in engineering, business, science, medicine, and the humanities.", subjectsZh: ["工程", "商业", "医学"], subjectsEn: ["Engineering", "Business", "Medicine"], ...privateIntake, ...privateFees, ...pendingRanking, ...standardEntry },
  city: { introductionZh: "马来西亚城市大学在八打灵再也等地设有校区，提供商业、教育、工程、信息技术及创意产业课程。", introductionEn: "City University Malaysia has campuses including Petaling Jaya and offers programmes in business, education, engineering, information technology, and the creative industries.", subjectsZh: ["商业", "信息技术", "设计"], subjectsEn: ["Business", "Information technology", "Design"], ...privateIntake, ...privateFees, ...pendingRanking, ...standardEntry },
  monash: { introductionZh: "莫纳什大学马来西亚分校位于双威城，提供澳大利亚大学体系下的多学科课程。", introductionEn: "Monash University Malaysia is based in Bandar Sunway and offers multidisciplinary programmes within the Australian university's academic system.", subjectsZh: ["医学", "工程", "商业"], subjectsEn: ["Medicine", "Engineering", "Business"], ...branchIntake, ...branchFees, ...globalRanking("莫纳什大学", "Monash University"), ...standardEntry },
  nottingham: { introductionZh: "诺丁汉大学马来西亚分校位于士毛月，提供英国大学体系下的本科及研究生课程。", introductionEn: "University of Nottingham Malaysia is located in Semenyih and offers undergraduate and postgraduate programmes within a UK university system.", subjectsZh: ["工程", "商业", "药剂学"], subjectsEn: ["Engineering", "Business", "Pharmacy"], ...branchIntake, ...branchFees, ...globalRanking("诺丁汉大学", "the University of Nottingham"), ...standardEntry },
  southampton: { introductionZh: "南安普顿大学马来西亚分校位于依斯干达公主城，以工程、商业及计算机课程为重点。", introductionEn: "University of Southampton Malaysia is based in Iskandar Puteri, with a focus on engineering, business, and computing.", subjectsZh: ["工程", "计算机", "商业"], subjectsEn: ["Engineering", "Computing", "Business"], ...branchIntake, ...branchFees, ...globalRanking("南安普顿大学", "the University of Southampton"), ...standardEntry },
  help: { introductionZh: "精英大学在莎阿南与吉隆坡设有校区，提供商业、心理学、法律、教育及信息技术课程。", introductionEn: "HELP University has campuses in Shah Alam and Kuala Lumpur and offers programmes in business, psychology, law, education, and information technology.", subjectsZh: ["商业", "心理学", "法律"], subjectsEn: ["Business", "Psychology", "Law"], ...privateIntake, ...privateFees, ...pendingRanking, ...standardEntry },
  mahsa: { introductionZh: "玛莎大学位于雪兰莪州仁嘉隆，以医学、牙科、药剂、护理及相关健康科学课程见长。", introductionEn: "MAHSA University is based in Jenjarom, Selangor, and is known for medicine, dentistry, pharmacy, nursing, and allied health programmes.", subjectsZh: ["医学", "牙科", "药剂学"], subjectsEn: ["Medicine", "Dentistry", "Pharmacy"], ...privateIntake, ...privateFees, ...pendingRanking, ...standardEntry },
  nilai: { introductionZh: "汝来大学位于森美兰州汝来，提供商业、工程、酒店管理、航空及健康科学课程。", introductionEn: "Nilai University is located in Nilai, Negeri Sembilan, and offers programmes in business, engineering, hospitality, aviation, and health sciences.", subjectsZh: ["航空", "商业", "酒店管理"], subjectsEn: ["Aviation", "Business", "Hospitality"], ...privateIntake, ...privateFees, ...pendingRanking, ...standardEntry },
};

export const FEATURED_UNIVERSITY_IDS = ["apu", "um", "taylors", "sunway", "ukm", "monash"] as const;

export function universityProfile(id: string) {
  return UNIVERSITY_PROFILES[id];
}
