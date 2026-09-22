import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Pagination } from "@/components/pagination";
import { ResultsState } from "@/components/results-state";
import { getFilterOptions } from "@/lib/filter-options-api";
import {
  getUniversityDetail,
  getUniversityProgrammes,
  toUniversityDetailView,
} from "@/lib/university-api";
import { boundedPage, isLocale, pageLink, type Query, words } from "@/lib/site";

type DetailProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Query>;
};

export default async function Detail({ params, searchParams }: DetailProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  if (slug === "preview") return <DetailPreview locale={locale} />;

  const query = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [detailResult, programmeResult, filterResult] = await Promise.all([
    getUniversityDetail(baseUrl, slug),
    getUniversityProgrammes(baseUrl, slug, query),
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

  return <main id="main" className="container page-main">
    <BackLink locale={locale} />
    <p className="section-label">{words(locale, "院校资料", "University information")}</p>
    <h1>{view.name}</h1>
    {view.secondaryName && <p className="detail-secondary-name">{view.secondaryName}</p>}
    <p className="page-intro">
      {[view.country, view.city].filter(Boolean).join(" · ")
        || words(locale, "地区资料待补充", "Location information pending")}
    </p>

    <div className="detail-layout">
      <div>
        <section className="detail-section">
          <h2>{words(locale, "院校介绍", "University profile")}</h2>
          <div
            className="detail-image university-logo-panel"
            aria-label={words(locale, "院校标志占位", "University logo placeholder")}
          >
            <span>{view.name.slice(0, 1)}</span>
          </div>
          <p>{view.description || words(
            locale,
            "院校介绍正在审核整理中。如需了解校区与申请信息，请咨询顾问。",
            "The reviewed university introduction is being prepared. Please ask an adviser about campuses and applications.",
          )}</p>
        </section>

        <section className="detail-section" aria-labelledby="programme-list-heading">
          <div className="results-heading">
            <h2 id="programme-list-heading">{words(locale, "课程列表", "Programmes")}</h2>
            {programmePage && <span>{words(
              locale,
              `共 ${programmePage.totalItems} 个已审核课程`,
              `${programmePage.totalItems} reviewed programmes`,
            )}</span>}
          </div>

          {programmeResult.status === "error"
            ? <div className="programme-results-state">
              <ResultsState locale={locale} state="error" />
            </div>
            : view.programmes.length
              ? <div className="programme-detail-list">
                {view.programmes.map((programme) => <article className="programme-detail-card" key={programme.id}>
                  <h3>{programme.name}</h3>
                  {programme.secondaryName && <p className="detail-secondary-name">{programme.secondaryName}</p>}
                  {programme.description && <p>{programme.description}</p>}
                  <dl className="course-details">
                    <ProgrammeFact locale={locale} zh="专业分类" en="Subject" value={programme.category} />
                    <ProgrammeFact locale={locale} zh="学历层次" en="Study level" value={programme.level} />
                    <ProgrammeFact locale={locale} zh="课程模式" en="Study mode" value={programme.mode} />
                    <ProgrammeFact locale={locale} zh="授课语言" en="Language" value={programme.languages} />
                    <ProgrammeFact locale={locale} zh="学制" en="Duration" value={programme.duration} />
                    <ProgrammeFact locale={locale} zh="参考学费" en="Tuition" value={programme.tuition} />
                    <ProgrammeFact locale={locale} zh="入学时间" en="Intakes" value={programme.intakes} />
                  </dl>
                </article>)}
              </div>
              : <div className="results-state" role="status">
                <span className="state-symbol" aria-hidden="true">○</span>
                <h3>{words(locale, "暂无已审核课程", "No reviewed programmes yet")}</h3>
                <p>{words(
                  locale,
                  "课程资料完成审核后将在这里显示。",
                  "Programmes will appear here after their information is reviewed.",
                )}</p>
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

      <aside className="detail-aside">
        <h2>{words(locale, "咨询此院校", "Enquire about this university")}</h2>
        <p>{words(
          locale,
          "向顾问了解院校、专业与申请安排。",
          "Ask an adviser about the university, courses, and application process.",
        )}</p>
        <Link className="button full-width" href={`/${locale}/consultation`}>
          {words(locale, "开始咨询", "Start an enquiry")} <span aria-hidden="true">→</span>
        </Link>
        <div className="qr-placeholder">{words(
          locale,
          "咨询二维码确认后将在此发布",
          "The enquiry QR code will appear after approval",
        )}</div>
      </aside>
    </div>
  </main>;
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
    <h1>{words(locale, "院校资料正在接入", "University information is being connected")}</h1>
    <p className="page-intro">{words(
      locale,
      "当前不会显示未经审核的院校或课程资料。",
      "Unreviewed university or course information is not displayed.",
    )}</p>
  </main>;
}
