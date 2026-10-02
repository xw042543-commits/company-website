import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Pagination } from "@/components/pagination";
import { ResultsState } from "@/components/results-state";
import { SaveToggle } from "@/components/save-toggle";
import { universityProfile } from "@/data/university-profiles";
import { findUniversityBySlug } from "@/data/university-catalog";
import { localProgrammeLevels } from "@/data/local-programmes";
import { getFilterOptions } from "@/lib/filter-options-api";
import { serverApiBaseUrl } from "@/lib/runtime-config";
import {
  toUniversityDetailView,
} from "@/lib/university-api";
import {
  getUniversityDetailWithFallback,
  getUniversityProgrammesWithFallback,
} from "@/lib/universities";
import { boundedPage, first, isLocale, pageLink, type Query, words } from "@/lib/site";

type DetailProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Query>;
};

export default async function Detail({ params, searchParams }: DetailProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  if (slug === "preview") return <DetailPreview locale={locale} />;

  const query = await searchParams;
  const baseUrl = serverApiBaseUrl();
  const [detailResult, programmeResult, filterResult] = await Promise.all([
    getUniversityDetailWithFallback(slug, baseUrl),
    getUniversityProgrammesWithFallback(slug, query, baseUrl),
    getFilterOptions(baseUrl),
  ]);

  if (detailResult.status === "not-found") notFound();

  if (detailResult.status === "error") {
    return <main id="main" className="container page-main">
      <BackLink locale={locale} />
      <ResultsState locale={locale} state="error" />
    </main>;
  }

  const programmes = programmeResult.status === "ready"
    ? programmeResult.page.items
    : [];
  const programmePage = programmeResult.status === "ready"
    ? programmeResult.page
    : undefined;
  const detailPath = `/${locale}/universities/${encodeURIComponent(slug)}`;

  if (programmePage) {
    const normalizedPage = boundedPage(programmePage.page, programmePage.totalPages);
    if (normalizedPage !== programmePage.page) {
      redirect(pageLink(detailPath, query, normalizedPage));
    }
  }

  const view = toUniversityDetailView(
    detailResult.university,
    programmes,
    locale,
    filterResult.status === "ready" ? filterResult.options : undefined,
  );
  const directoryUniversity = findUniversityBySlug(slug);
  const profile = directoryUniversity ? universityProfile(directoryUniversity.id) : undefined;
  const selectedLevel = first(query, "level");
  const programmeKeyword = first(query, "q");
  const availableLevels = localProgrammeLevels(slug);

  return <main id="main" className="container page-main">
    <BackLink locale={locale} />
    <header className="university-detail-header">
      <div className="university-detail-heading">
        <p className="section-label">{words(locale, "院校资料", "University information")}</p>
        <h1>{view.name}</h1>
        {view.secondaryName && <p className="detail-secondary-name">{view.secondaryName}</p>}
        <p className="page-intro">
          {[view.country, view.city].filter(Boolean).join(" · ")
            || words(locale, "地区资料待补充", "Location information pending")}
        </p>
      </div>
      <div className="detail-quick-actions"><SaveToggle locale={locale} item={{ key: `university:${slug}`, kind: "university", name: view.name, secondaryName: view.secondaryName, context: [view.city, view.country].filter(Boolean).join(", "), path: detailPath }} /><Link className="button" href={`/${locale}/about#enquiry`}>{words(locale, "咨询顾问", "Ask an adviser")} <span aria-hidden="true">→</span></Link></div>
    </header>
    <nav className="university-detail-nav" aria-label={words(locale, "院校页面导航", "University page navigation")}>
      <a href="#overview">{words(locale, "院校概览", "Overview")}</a>
      <a href="#programmes">{words(locale, "课程", "Programmes")}</a>
      <a href="#enquiry">{words(locale, "咨询", "Enquiry")}</a>
    </nav>

    <div className="detail-layout">
      <div>
        <section className="detail-section" id="overview">
          <h2>{words(locale, "院校介绍", "University profile")}</h2>
          <div className={`detail-image university-profile-media${profile?.campusImageSrc ? " has-photo" : ""}`}>
            {profile?.campusImageSrc
              ? <Image src={profile.campusImageSrc} fill sizes="(max-width: 760px) 100vw, 640px" alt={words(locale, `${view.name} 校园`, `${view.name} campus`)} priority />
              : directoryUniversity?.logoSrc
                ? <Image src={directoryUniversity.logoSrc} width={640} height={320} sizes="(max-width: 760px) 100vw, 640px" alt={words(locale, `${view.name} 标志`, `${view.name} logo`)} priority />
                : <span>{view.name.slice(0, 1)}</span>}
          </div>
          <p>{view.description || (profile ? (locale === "zh" ? profile.introductionZh : profile.introductionEn) : words(
            locale,
            "院校介绍正在审核整理中。如需了解校区与申请信息，请咨询顾问。",
            "The reviewed university introduction is being prepared. Please ask an adviser about campuses and applications.",
          ))}</p>
          {profile?.imageCredit && <p className="image-credit">{words(locale, "图片来源", "Image source")}: <a href={profile.imageCredit.href} target="_blank" rel="noreferrer">{profile.imageCredit.label}</a></p>}
        </section>

        <section className="detail-section" id="programmes" aria-labelledby="programme-list-heading">
          <div className="results-heading">
            <h2 id="programme-list-heading">{words(locale, "课程列表", "Programmes")}</h2>
            {programmePage && <span>{words(
              locale,
              `共 ${programmePage.totalItems} 个已审核课程`,
              `${programmePage.totalItems} reviewed programmes`,
            )}</span>}
          </div>
          <div className="programme-tools">
            <form className="programme-search" action={detailPath} method="get">
              <label htmlFor="programme-query">{words(locale, "搜索此院校的课程", "Search programmes at this university")}</label>
              <div><input id="programme-query" name="q" type="search" defaultValue={programmeKeyword} placeholder={words(locale, "输入课程名称或专业关键词", "Programme name or subject keyword")} /><button type="submit">{words(locale, "搜索", "Search")}</button></div>
              {selectedLevel && <input type="hidden" name="level" value={selectedLevel} />}
            </form>
            <div className="programme-filter-row">
              {availableLevels.length > 0 && <nav className="programme-level-filters" aria-label={words(locale, "按学历层次筛选", "Filter by study level")}>
                <Link scroll={false} aria-current={!selectedLevel ? "page" : undefined} href={programmeLevelLink(detailPath, query, "")}>{words(locale, "全部", "All")}</Link>
                {[["bachelor", "本科", "Bachelor\u2019\u2060s"], ["master", "硕士", "Master\u2019\u2060s"], ["doctorate", "博士", "Doctorate"]].filter(([level]) => availableLevels.includes(level as "bachelor" | "master" | "doctorate")).map(([level, zh, en]) => <Link scroll={false} key={level} aria-current={selectedLevel === level ? "page" : undefined} href={programmeLevelLink(detailPath, query, level)}>{words(locale, zh, en)}</Link>)}
              </nav>}
              {programmeKeyword && <Link scroll={false} className="programme-search-clear" href={programmeLevelLink(detailPath, { level: selectedLevel }, selectedLevel)}>{words(locale, "清除搜索", "Clear search")}</Link>}
            </div>
          </div>
          <p className="programme-review-note">{words(locale, "以下资料已经审核。费用与入学要求可能调整，请在申请前向顾问确认最新信息。", "The information below has been reviewed. Fees and entry requirements may change, so confirm the latest details with an adviser before applying.")}</p>

          {programmeResult.status === "error"
            ? <div className="programme-results-state">
              <ResultsState locale={locale} state="error" />
            </div>
            : view.programmes.length
              ? <div className="programme-detail-list">
                {view.programmes.map((programme) => {
                  const programmePath = `${detailPath}/programmes/${encodeURIComponent(programme.id)}`;
                  return <article className="programme-detail-card" id={`programme-${programme.id}`} key={programme.id}>
                  <div className="programme-card-heading"><h3><Link className="programme-title-link" href={programmePath}>{programme.name}</Link></h3><SaveToggle compact locale={locale} item={{ key: `programme:${slug}:${programme.id}`, kind: "programme", name: programme.name, secondaryName: programme.secondaryName, context: view.name, path: programmePath, facts: [[words(locale, "学历", "Level"), programme.level], [words(locale, "学制", "Duration"), programme.duration], [words(locale, "参考学费", "Tuition"), programme.tuition]].filter((fact): fact is [string, string] => Boolean(fact[1])).map(([label, value]) => ({ label, value })) }} /></div>
                  {programme.secondaryName && <p className="detail-secondary-name">{programme.secondaryName}</p>}
                  <dl className="course-details">
                    <ProgrammeFact locale={locale} zh="专业分类" en="Subject" value={programme.category} />
                    <ProgrammeFact locale={locale} zh="学历层次" en="Study level" value={programme.level} />
                    <ProgrammeFact locale={locale} zh="课程模式" en="Study mode" value={programme.mode} />
                    <ProgrammeFact locale={locale} zh="授课语言" en="Language" value={programme.languages} />
                    <ProgrammeFact locale={locale} zh="学制" en="Duration" value={programme.duration} />
                    <ProgrammeFact locale={locale} zh="参考学费" en="Tuition" value={programme.tuition} />
                    <ProgrammeFact locale={locale} zh="入学时间" en="Intakes" value={programme.intakes} />
                  </dl>
                  {programme.description && <details className="programme-requirements"><summary>{words(locale, "查看入学要求与其他费用", "View entry requirements and other fees")}</summary><p>{programme.description}</p></details>}
                  <Link className="programme-card-link" href={programmePath}>{words(locale, "查看课程详情", "View programme details")}</Link>
                </article>})}
              </div>
              : <div className="results-state" role="status">
                <span className="state-symbol" aria-hidden="true">○</span>
                <h3>{programmeKeyword ? words(locale, "没有找到匹配课程", "No matching programmes found") : words(locale, "暂无已审核课程", "No reviewed programmes yet")}</h3>
                <p>{words(
                  locale,
                  programmeKeyword ? "请尝试更简短的关键词，或清除搜索查看全部课程。" : "课程资料完成审核后将在这里显示。",
                  programmeKeyword ? "Try a shorter keyword or clear the search to see every programme." : "Programmes will appear here after their information is reviewed.",
                )}</p>
                {programmeKeyword && <Link className="button" href={programmeLevelLink(detailPath, { level: selectedLevel }, selectedLevel)}>{words(locale, "查看全部课程", "View all programmes")}</Link>}
              </div>}

          {programmePage && <Pagination
            locale={locale}
            path={detailPath}
            query={query}
            page={programmePage.page}
            total={programmePage.totalItems}
          />}
        </section>
      </div>

      <aside className="detail-aside university-enquiry-card" id="enquiry">
        <h2>{words(locale, "咨询此院校", "Enquire about this university")}</h2>
        <p>{words(
          locale,
          "向顾问了解院校、专业与申请安排。",
          "Ask an adviser about the university, courses, and application process.",
        )}</p>
        <Link className="button full-width" href={`/${locale}/about#enquiry`}>
          {words(locale, "开始咨询", "Start an enquiry")} <span aria-hidden="true">→</span>
        </Link>
        <div className="enquiry-preparation">
          <h3>{words(locale, "咨询前可以准备", "Helpful details to prepare")}</h3>
          <ul>
            <li>{words(locale, "计划申请的学历层次", "Your intended study level")}</li>
            <li>{words(locale, "感兴趣的专业方向", "Subjects you are interested in")}</li>
            <li>{words(locale, "预计入学时间", "Your preferred intake period")}</li>
          </ul>
        </div>
      </aside>
    </div>
  </main>;
}

function programmeLevelLink(path: string, query: Query, level: string) {
  const parameters = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(query)) {
    if (key === "page" || key === "level") continue;
    for (const value of Array.isArray(rawValue) ? rawValue : [rawValue]) {
      if (value?.trim()) parameters.append(key, value.trim());
    }
  }
  if (level) parameters.set("level", level);
  const suffix = parameters.toString();
  return suffix ? `${path}?${suffix}` : path;
}

function BackLink({ locale }: { locale: "zh" | "en" }) {
  return <Link className="back-link" href={`/${locale}/universities`}>
    <span aria-hidden="true">←</span> {words(locale, "返回院校一览", "Back to universities")}
  </Link>;
}

function ProgrammeFact({
  locale,
  zh,
  en,
  value,
}: {
  locale: "zh" | "en";
  zh: string;
  en: string;
  value: string;
}) {
  if (!value) return null;
  return <div><dt>{words(locale, zh, en)}</dt><dd>{value}</dd></div>;
}

function DetailPreview({ locale }: { locale: "zh" | "en" }) {
  return <main id="main" className="container page-main">
    <BackLink locale={locale} />
    <p className="section-label">{words(locale, "院校资料", "University information")}</p>
    <h1>{words(locale, "院校资料正在完善", "University information is being prepared")}</h1>
    <p className="page-intro">{words(
      locale,
      "当前不会显示未经审核的院校或课程资料。",
      "Unreviewed university or course information is not displayed.",
    )}</p>
  </main>;
}
