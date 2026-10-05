import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SaveToggle } from "@/components/save-toggle";
import { findLocalProgrammeBySlug, formatFeeDisplay, formatIntakeDisplay, formatProgrammeDuration, splitProgrammeName, type LocalProgrammeDetail } from "@/data/local-programmes";
import { backendUniversitySlug, findUniversityBySlug, localizeUniversity } from "@/data/university-catalog";
import { universityProfile } from "@/data/university-profiles";
import { getFilterOptions, type FilterOption, type FilterOptions } from "@/lib/filter-options-api";
import { programmeDetailPath } from "@/lib/programme-routes";
import { serverApiBaseUrl } from "@/lib/runtime-config";
import { isLocale, words } from "@/lib/site";
import { getUniversityProgramme, type UniversityProgramme } from "@/lib/university-api";

type ProgrammePageProps = {
  params: Promise<{ locale: string; slug: string; programmeId: string }>;
};

type ProgrammeDetail = Pick<
  LocalProgrammeDetail,
  | "nameZh"
  | "nameEn"
  | "facultyZh"
  | "facultyEn"
  | "mode"
  | "duration"
  | "tuition"
  | "registrationFee"
  | "intakes"
  | "descriptionZh"
  | "descriptionEn"
> & {
  level: string;
  routeIdentifier: string;
  sourceSlug: string;
};

function optionLabel(options: FilterOption[] | undefined, code: string | null, locale: "zh" | "en") {
  if (!code) return "";
  const option = options?.find((candidate) => candidate.code === code);
  if (!option) return code;
  return locale === "zh"
    ? option.nameZh.trim() || option.nameEn.trim() || code
    : option.nameEn.trim() || option.nameZh.trim() || code;
}

function normalizedLevel(code: string | null) {
  const levels: Record<string, string> = {
    BACHELOR: "bachelor",
    MASTER: "master",
    DOCTORATE: "doctorate",
  };
  return levels[code?.toUpperCase() ?? ""] ?? code?.toLocaleLowerCase("en") ?? "";
}

function remoteProgrammeDetail(
  programme: UniversityProgramme,
  options: FilterOptions | undefined,
  locale: "zh" | "en",
): ProgrammeDetail {
  const facultyZh = optionLabel(options?.subjectCategories, programme.categoryCode, "zh");
  const facultyEn = optionLabel(options?.subjectCategories, programme.categoryCode, "en");
  const intakeSeparator = locale === "zh" ? "、" : ", ";
  const intakeDisplay = programme.intakeDisplayTexts.length
    ? programme.intakeDisplayTexts
    : programme.intakeMonths;
  return {
    level: normalizedLevel(programme.studyLevelCode),
    nameZh: programme.nameZh?.trim() || programme.nameEn?.trim() || programme.programmeCode,
    nameEn: programme.nameEn?.trim() || programme.nameZh?.trim() || programme.programmeCode,
    facultyZh,
    facultyEn,
    duration: programme.durationDisplay
      ?? (programme.durationMonths ? `${programme.durationMonths} months` : ""),
    registrationFee: "",
    tuition: programme.tuitionDisplay ?? "",
    intakes: intakeDisplay.join(intakeSeparator),
    mode: optionLabel(options?.courseModes, programme.courseModeCode, locale),
    sourceSlug: programme.slug,
    routeIdentifier: String(programme.id),
    descriptionZh: programme.descriptionZh?.trim() || "",
    descriptionEn: programme.descriptionEn?.trim() || "",
  };
}

function levelName(locale: "zh" | "en", level: string) {
  const values: Record<string, [string, string]> = {
    bachelor: ["本科", "Bachelor\u2019\u2060s"],
    master: ["硕士", "Master\u2019\u2060s"],
    doctorate: ["博士", "Doctorate"],
  };
  const value = values[level];
  return value ? words(locale, value[0], value[1]) : level;
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function IntakeFact({ locale, value }: { locale: "zh" | "en"; value?: string }) {
  if (!value) return null;
  const values = value.split(locale === "zh" ? "、" : ",").map((item) => item.trim()).filter(Boolean);
  return <div className="programme-intake-fact"><dt>{words(locale, "入学时间", "Intakes")}</dt><dd>{values.map((item) => <span key={item}>{item}</span>)}</dd></div>;
}

function programmeIntroduction({
  locale,
  name,
  university,
  faculty,
  level,
  mode,
  duration,
}: {
  locale: "zh" | "en";
  name: string;
  university: string;
  faculty: string;
  level: string;
  mode: string;
  duration: string;
}) {
  if (locale === "zh") {
    const details = [mode, duration].filter(Boolean).join("、");
    return `${name}是${university}${faculty ? `在${faculty}` : ""}开设的${level}课程${details ? `，目前已审核的课程资料显示其学制与授课安排为${details}` : ""}。你可以在本页查看费用、入学时间和申请条件；具体课程模块、选修方向与考核方式请在申请前向顾问索取大学最新课程说明。`;
  }

  const details = [mode && `${mode} study`, duration && `a duration of ${duration}`].filter(Boolean);
  return `${name} is a ${level.toLocaleLowerCase("en")} programme${faculty ? ` in ${faculty}` : ""} offered by ${university}.${details.length ? ` The reviewed course record lists ${details.join(" and ")}.` : ""} Use this page to review the available fees, intakes, and entry requirements. Ask an adviser for the university’s latest curriculum before applying, including confirmed modules, electives, and assessment details.`;
}

function careerDirections(locale: "zh" | "en", subject: string) {
  const text = subject.toLocaleLowerCase("en");
  const groups: Array<[RegExp, string[], string[]]> = [
    [/comput|software|data|cyber|information technology|人工智能|计算机/, ["软件开发", "数据分析", "系统分析", "网络安全", "产品管理"], ["Software development", "Data analysis", "Systems analysis", "Cybersecurity", "Product management"]],
    [/business|management|finance|marketing|account|商业|管理|金融|营销|会计/, ["商业分析", "市场营销", "运营管理", "项目管理", "创业"], ["Business analysis", "Marketing", "Operations management", "Project management", "Entrepreneurship"]],
    [/engineer|工程/, ["工程设计", "项目工程", "质量保证", "技术咨询", "运营管理"], ["Engineering design", "Project engineering", "Quality assurance", "Technical consulting", "Operations management"]],
    [/health|medic|pharmacy|nurs|医学|健康|药剂|护理/, ["临床与健康服务", "医学研究", "公共卫生", "医疗管理", "健康教育"], ["Clinical and health services", "Medical research", "Public health", "Healthcare management", "Health education"]],
    [/law|法律/, ["法律服务", "合规", "企业治理", "政策研究", "争议解决"], ["Legal services", "Compliance", "Corporate governance", "Policy research", "Dispute resolution"]],
    [/design|architecture|media|设计|建筑|媒体/, ["设计与创意制作", "用户体验", "品牌传播", "项目设计", "创意创业"], ["Design and creative production", "User experience", "Brand communication", "Design project work", "Creative entrepreneurship"]],
    [/education|教育/, ["教学", "课程开发", "教育管理", "学生支持", "教育研究"], ["Teaching", "Curriculum development", "Education management", "Student support", "Education research"]],
    [/hospitality|tourism|culinary|酒店|旅游|烹饪/, ["酒店运营", "旅游策划", "活动管理", "客户体验", "餐饮管理"], ["Hospitality operations", "Tourism planning", "Events management", "Customer experience", "Food and beverage management"]],
    [/agricultur|science|biology|chemistry|农业|科学|生物|化学/, ["研究与实验室工作", "质量控制", "技术咨询", "可持续发展", "科学传播"], ["Research and laboratory work", "Quality control", "Technical consulting", "Sustainability", "Science communication"]],
  ];
  const group = groups.find(([pattern]) => pattern.test(text));
  return group ? (locale === "zh" ? group[1] : group[2]) : (locale === "zh"
    ? ["行业研究", "项目协调", "顾问服务", "运营支持", "继续深造"]
    : ["Industry research", "Project coordination", "Consulting", "Operations support", "Further study"]);
}

export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { locale, slug, programmeId } = await params;
  if (!isLocale(locale)) notFound();

  const university = findUniversityBySlug(slug);
  if (!university) notFound();

  const baseUrl = serverApiBaseUrl();
  let programme: ProgrammeDetail | undefined;
  if (baseUrl) {
    const [programmeResult, filterResult] = await Promise.all([
      getUniversityProgramme(baseUrl, backendUniversitySlug(slug), programmeId),
      getFilterOptions(baseUrl),
    ]);
    if (programmeResult.status === "not-found") notFound();
    if (programmeResult.status === "error") {
      throw new Error("Programme detail service is unavailable");
    }
    programme = remoteProgrammeDetail(
      programmeResult.programme,
      filterResult.status === "ready" ? filterResult.options : undefined,
      locale,
    );
  } else {
    const localProgramme = findLocalProgrammeBySlug(slug, programmeId);
    if (localProgramme) {
      programme = {
        ...localProgramme,
        sourceSlug: localProgramme.slug,
        routeIdentifier: localProgramme.slug,
      };
    }
  }
  if (!programme) notFound();

  const school = localizeUniversity(university, locale);
  const profile = universityProfile(university.id);
  const presentation = splitProgrammeName((locale === "zh" ? programme.nameZh : programme.nameEn) || programme.nameEn || programme.nameZh);
  const secondaryPresentation = splitProgrammeName(locale === "zh" ? programme.nameEn : programme.nameZh);
  const name = presentation.name;
  const secondaryName = secondaryPresentation.name;
  const faculty = (locale === "zh" ? programme.facultyZh : programme.facultyEn) || programme.facultyEn || programme.facultyZh;
  const detailPath = programmeDetailPath(locale, university.slug, programme.routeIdentifier);
  const universityPath = `/${locale}/universities/${encodeURIComponent(university.slug)}`;
  const requirements = locale === "zh" ? programme.descriptionZh : programme.descriptionEn;
  const isVerifiedTaylorsBusiness = programme.sourceSlug === "taylors-bachelor-403";
  const duration = isVerifiedTaylorsBusiness ? words(locale, "3年（全日制）", "3 years (full time)") : formatProgrammeDuration(programme.duration) || "";
  const tuition = isVerifiedTaylorsBusiness
    ? words(locale, "本地生 MYR 129,830；国际生 USD 42,309", "Local MYR 129,830; international USD 42,309")
    : formatFeeDisplay(programme.tuition);
  const registrationFee = formatFeeDisplay(programme.registrationFee);
  const intakes = isVerifiedTaylorsBusiness
    ? words(locale, "2月、4月、9月", "February, April, September")
    : formatIntakeDisplay(programme.intakes, locale);
  const taylorsSpecialisations = locale === "zh"
    ? ["金融", "营销", "管理", "数字营销与分析", "数字业务与转型", "全球业务与可持续发展", "供应链管理（2026年2月起）"]
    : ["Finance", "Marketing", "Management", "Digital Marketing and Analytics", "Digital Business and Transformation", "Global Business and Sustainability", "Supply Chain Management (from February 2026)"];
  const specialisations = isVerifiedTaylorsBusiness ? taylorsSpecialisations : presentation.specialisations;
  const verifiedCareers = locale === "zh"
    ? ["商业顾问", "公共关系专员", "创业者", "产品开发经理", "业务拓展", "战略营销专家", "社交媒体专员", "市场研究员"]
    : ["Business consultant", "Public relations specialist", "Entrepreneur", "Product development manager", "Business developer", "Strategic marketing expert", "Social media specialist", "Market researcher"];
  const careers = isVerifiedTaylorsBusiness ? verifiedCareers : careerDirections(locale, `${faculty} ${name}`);
  const generatedIntroduction = programmeIntroduction({
    locale,
    name,
    university: school.name,
    faculty,
    level: levelName(locale, programme.level),
    mode: programme.mode,
    duration,
  });
  const introduction = isVerifiedTaylorsBusiness
    ? words(locale, "Taylor’s商业学士（荣誉）课程涵盖管理、营销、金融、商业运营与分析等核心领域。学生先建立广泛的商业基础，再选择一个专业方向，以项目、行业接触和实习经验发展实际应用能力。", "Taylor’s Bachelor of Business (Honours) covers core areas including management, marketing, finance, business operations, and analytics. Students first build a broad business foundation, then choose one specialisation and develop applied skills through projects, industry exposure, and internship experience.")
    : generatedIntroduction;
  const adviserPath = `/${locale}/about?university=${encodeURIComponent(school.name)}&programme=${encodeURIComponent(name)}#enquiry`;

  return <main id="main" className="programme-page">
    <section className="programme-hero">
      <div className="container">
        <nav className="programme-breadcrumbs" aria-label={words(locale, "面包屑导航", "Breadcrumb")}>
          <Link href={`/${locale}/universities`}>{words(locale, "院校", "Universities")}</Link>
          <span aria-hidden="true">/</span>
          <Link href={universityPath}>{school.name}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{name}</span>
        </nav>
        <div className="programme-hero-grid">
          <div className="programme-hero-copy">
            <p className="section-label">{faculty || words(locale, "已审核课程", "Reviewed programme")}</p>
            <h1 className={name.length > 48 ? "long-title" : undefined}>{name}</h1>
            <div className="programme-school-affiliation">
              {university.logoSrc && <span className="programme-school-logo"><Image src={university.logoSrc} width={54} height={54} alt="" /></span>}
              <div><p>{words(locale, "就读于", "At")} {school.name}</p>{secondaryName && secondaryName !== name && <span>{secondaryName}</span>}</div>
            </div>
            <div className="programme-hero-actions">
              <Link className="button" href={adviserPath}>{words(locale, "咨询此课程", "Enquire about this programme")}</Link>
              <SaveToggle locale={locale} item={{
                key: `programme:${university.slug}:${programme.routeIdentifier}`,
                kind: "programme",
                name,
                secondaryName,
                context: school.name,
                path: detailPath,
                facts: [
                  { label: words(locale, "学历", "Level"), value: levelName(locale, programme.level) },
                  ...(duration ? [{ label: words(locale, "学制", "Duration"), value: duration }] : []),
                  ...(tuition ? [{ label: words(locale, "参考学费", "Tuition"), value: tuition }] : []),
                ],
              }} />
            </div>
          </div>
          <div className={`programme-hero-visual${profile?.campusImageSrc ? " has-photo" : ""}`}>
            {profile?.campusImageSrc
              ? <Image src={profile.campusImageSrc} fill sizes="(max-width: 760px) 100vw, 520px" alt={words(locale, `${school.name} 校园`, `${school.name} campus`)} priority />
              : <div><span>{university.id.toUpperCase()}</span><p>{school.city}</p></div>}
          </div>
        </div>
      </div>
    </section>

    <dl className="container programme-fact-strip">
      <Fact label={words(locale, "地点", "Location")} value={[school.city, school.country].filter(Boolean).join(", ")} />
      <Fact label={words(locale, "学历", "Qualification")} value={levelName(locale, programme.level)} />
      <Fact label={words(locale, "参考学费", "Indicative tuition")} value={tuition} />
      <Fact label={words(locale, "学制", "Duration")} value={duration} />
      <IntakeFact locale={locale} value={intakes} />
      <Fact label={words(locale, "授课方式", "Study mode")} value={programme.mode} />
    </dl>

    <div className="container programme-page-layout">
      <div className="programme-content">
        <section className="programme-section">
          <p className="section-label">{words(locale, "课程资料", "Programme information")}</p>
          <h2>{words(locale, "课程介绍", "About this programme")}</h2>
          <p>{introduction}</p>
          <div className="programme-highlights">
            <span>{faculty || words(locale, "专业分类待确认", "Subject to be confirmed")}</span>
            <span>{levelName(locale, programme.level)}</span>
            <span>{words(locale, "英语授课", "Taught in English")}</span>
          </div>
          {specialisations.length > 0 && <div className="programme-specialisations">
            <h3>{words(locale, "可选专业方向", "Available specialisations")}</h3>
            <p>{words(locale, "该课程名称中的专业方向是可选择的学习路径，并非一个需要同时修读的超长课程。", "These are selectable study pathways within the degree, rather than one long combined programme.")}</p>
            <ul>{specialisations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>}
        </section>

        {isVerifiedTaylorsBusiness && <details className="programme-info-panel" open>
          <summary>{words(locale, "课程结构", "Programme structure")}</summary>
          <div className="programme-info-body">
            <p>{words(locale, "课程先建立商业运营、管理、营销、金融与数据分析基础，再让学生选择一个专业方向，并包括实习或行业沉浸学习。", "The programme builds a foundation in business operations, management, marketing, finance, and analytics before students select one specialisation. It also includes an internship or industry immersion experience.")}</p>
            <div className="programme-structure-grid">
              <div><h3>{words(locale, "共同核心课程", "Common core")}</h3><ul><li>{words(locale, "非专业会计", "Accounting for Non-Specialists")}</li><li>{words(locale, "管理学导论", "Introduction to Management")}</li><li>{words(locale, "市场营销原理", "Principles of Marketing")}</li><li>{words(locale, "商业经济学", "Business Economics")}</li><li>{words(locale, "金融学导论", "Introduction to Finance")}</li><li>{words(locale, "商业定量方法", "Quantitative Methods for Business")}</li></ul></div>
              <div><h3>{words(locale, "后期学习", "Later study")}</h3><ul><li>{words(locale, "国际商务导论", "Introduction to International Business")}</li><li>{words(locale, "创业基础", "Understanding Entrepreneurialism")}</li><li>{words(locale, "战略管理", "Strategic Management")}</li><li>{words(locale, "实习或行业沉浸", "Internship or Industry Immersion")}</li><li>{words(locale, "所选专业方向课程", "Selected specialisation modules")}</li></ul></div>
            </div>
          </div>
        </details>}

        <details className="programme-info-panel" open>
          <summary>{words(locale, "费用与入学时间", "Fees and intakes")}</summary>
          <div className="programme-info-body">
            <p>{words(locale, "费用为参考资料，大学可能按入学时间、学生身份或课程安排调整。申请前请确认最新费用。", "Fees are indicative and may vary by intake, student status, or course structure. Confirm the latest amount before applying.")}</p>
            <dl className="programme-inline-facts">
              <Fact label={words(locale, "参考学费", "Indicative tuition")} value={tuition || words(locale, "请咨询顾问", "Confirm with an adviser")} />
              <Fact label={words(locale, "注册费", "Registration fee")} value={registrationFee || words(locale, "请咨询顾问", "Confirm with an adviser")} />
              <IntakeFact locale={locale} value={intakes || words(locale, "请咨询顾问", "Confirm with an adviser")} />
            </dl>
            <p className="programme-source-note">{isVerifiedTaylorsBusiness
              ? words(locale, "2026年课程资料已与大学官网核对。官网目前公布2月、4月和9月三个入学月份；具体开课日、报到日期和时间会随每个入学批次公布。", "The 2026 programme information has been checked against the university website. It currently publishes February, April, and September intakes; exact commencement dates, registration dates, and times are issued for each intake.")
              : words(locale, "这里会显示资料中提供的所有入学月份。若大学尚未公开具体开课日、报到日期或时间，请在安排行程或签证前向顾问确认。", "Every intake period supplied in the reviewed record is shown here. When the university has not published exact commencement dates, registration dates, or times, confirm them before arranging travel or a visa.")} {isVerifiedTaylorsBusiness && <a href="https://university.taylors.edu.my/en/study/explore-all-programmes/business/undergraduate/bachelor-of-business.html" target="_blank" rel="noreferrer">{words(locale, "查看官方课程页", "View official programme page")}</a>}</p>
          </div>
        </details>

        <details className="programme-info-panel" open>
          <summary>{words(locale, "入学要求与申请", "Entry requirements and application")}</summary>
          <div className="programme-info-body">
            {requirements ? <p>{requirements}</p> : <p>{words(locale, "详细入学要求尚未提供。顾问可以根据你的学历与成绩确认申请资格。", "Detailed entry requirements have not been supplied. An adviser can confirm eligibility based on your qualifications and results.")}</p>}
            <div className="programme-applicant-grid">
              <section><h3>{words(locale, "中国学生", "Applicants from China")}</h3><p>{words(locale, "请提交高中或大学阶段的完整成绩单与毕业证明。中国学历的具体等值要求需要按学生背景逐一审核；官网未公布的高考分数线不会在这里推测。", "Submit complete senior-secondary or tertiary transcripts and graduation evidence. Chinese qualifications require an individual equivalency assessment; this page does not invent a Gaokao threshold that the university has not published.")}</p></section>
              <section><h3>{words(locale, "国际学生", "International applicants")}</h3>{isVerifiedTaylorsBusiness
                ? <p>{words(locale, "官网列出的入学途径包括：Taylor’s Foundation 或 Diploma CGPA 2.00、STPM 至少 CC、A Level 至少 DD、IB 24分、CPU 六科平均60%、MUFY 50%，或其他获认可的同等学历。英语要求包括 MUET Band 3、CEFR Low B2，或以英语完成的预科／文凭课程。", "Published pathways include Taylor’s Foundation or Diploma with CGPA 2.00, STPM minimum CC, A Level minimum DD, IB 24 points, CPU 60% across six subjects, MUFY 50%, or another recognised equivalent. English routes include MUET Band 3, CEFR Low B2, or a pre-university/diploma programme taught in English.")}</p>
                : <p>{words(locale, "此课程的已审核学术与英语要求显示在上方。不同国家的学历需要进行等值评估，请在申请前提交成绩单让顾问确认。", "The reviewed academic and English requirements appear above. Qualifications from different countries require an equivalency assessment, so submit your transcripts for confirmation before applying.")}</p>}</section>
            </div>
            <h3>{words(locale, "申请前建议准备", "What to prepare")}</h3>
            <ul className="programme-checklist">
              <li>{words(locale, "最新的学历证书与成绩单", "Your latest qualification certificates and transcripts")}</li>
              <li>{words(locale, "护照或身份证明", "Passport or identity document")}</li>
              <li>{words(locale, "英语能力证明（如课程要求）", "English proficiency results, if required")}</li>
              <li>{words(locale, "计划入学时间与预算", "Preferred intake and study budget")}</li>
            </ul>
          </div>
        </details>

        <details className="programme-info-panel" open>
          <summary>{words(locale, "未来职业方向", "Future career directions")}</summary>
          <div className="programme-info-body">
            <p>{isVerifiedTaylorsBusiness
              ? words(locale, "以下职业方向由Taylor’s University官方课程页列出。实际职位取决于所选专业方向、经验与当地专业要求。", "These career directions are listed on Taylor’s University’s official programme page. Actual roles depend on the chosen specialisation, experience, and local professional requirements.")
              : words(locale, "以下是根据课程所属学科整理的代表性职业方向，并非就业保证。申请前可向顾问索取大学公布的最新职业成果。", "These are representative directions based on the programme’s subject area and are not an employment guarantee. Ask an adviser for the university’s latest published graduate outcomes.")}</p>
            <ul className="programme-career-list">{careers.map((career) => <li key={career}>{career}</li>)}</ul>
          </div>
        </details>

        <details className="programme-info-panel">
          <summary>{words(locale, `关于${school.name}`, `About ${school.name}`)}</summary>
          <div className="programme-info-body">
            <p>{profile ? (locale === "zh" ? profile.introductionZh : profile.introductionEn) : words(locale, "院校介绍正在审核整理中。", "The university introduction is being reviewed.")}</p>
            <Link className="text-link" href={universityPath}>{words(locale, "查看院校资料", "View university profile")}</Link>
          </div>
        </details>
      </div>

      <aside className="programme-contact-card">
        <p className="section-label">{words(locale, "需要协助？", "Need help?")}</p>
        <h2>{words(locale, "让顾问帮你确认申请条件", "Let an adviser check your application")}</h2>
        <p>{words(locale, "告诉我们你的学历、成绩与计划入学时间，我们会协助你确认课程是否适合。", "Share your qualifications, results, and preferred intake so we can help confirm whether this programme fits your plans.")}</p>
        <Link className="button full-width" href={adviserPath}>{words(locale, "联系顾问", "Contact an adviser")}</Link>
        <small>{words(locale, "咨询前不会代表你提交申请。", "An enquiry does not submit an application.")}</small>
      </aside>
    </div>

    <section className="programme-action-plan">
      <div className="container">
        <p className="section-label">{words(locale, "下一步", "Your next steps")}</p>
        <h2>{words(locale, "从了解课程到准备申请", "From research to application")}</h2>
        <div className="programme-step-grid">
          <article><span>01</span><h3>{words(locale, "收藏课程", "Save the programme")}</h3><p>{words(locale, "保留感兴趣的课程，之后可在账户页面查看。", "Keep this programme in your shortlist and review it later from your account.")}</p></article>
          <article><span>02</span><h3>{words(locale, "核对申请条件", "Check your eligibility")}</h3><p>{words(locale, "根据你的学历与英语成绩确认是否符合要求。", "Confirm the academic and English requirements against your results.")}</p></article>
          <article><span>03</span><h3>{words(locale, "咨询并准备材料", "Enquire and prepare")}</h3><p>{words(locale, "向顾问确认最新费用、入学时间与所需文件。", "Ask an adviser to confirm current fees, intakes, and required documents.")}</p></article>
        </div>
      </div>
    </section>
  </main>;
}
