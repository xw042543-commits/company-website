import Image from "next/image";
import Link from "next/link";
import { ConsultationForm } from "@/components/consultation-form";
import { companyProfile, contactTelephoneHref, publicAdvisers } from "@/data/company-profile";
import { UNIVERSITY_CATALOG } from "@/data/university-catalog";
import { universityProfile } from "@/data/university-profiles";
import { type Locale, words } from "@/lib/site";

const modernUmCampus = "/universities/campuses/um-modern-campus.webp";

export function PublicHome({ locale }: { locale: Locale }) {
  const registerHref = `/${locale}/login?mode=register&returnTo=${encodeURIComponent(`/${locale}/planning`)}`;
  const loginHref = `/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/planning`)}`;
  const malaysiaAdviser = publicAdvisers.find(adviser => adviser.region === "MY") ?? publicAdvisers[0];
  const levels = [
    ["bachelor", "本科", "Bachelor\u2019\u2060s"],
    ["master", "硕士", "Master\u2019\u2060s"],
    ["doctorate", "博士", "Doctorate"],
    ["language", "语言课程", "Language courses"],
  ] as const;
  const tools = [
    ["校", "查询院校与专业", "Explore universities and programmes", "按学历、专业和地点查找经过审核的资料。", "Search reviewed information by qualification, subject, and location."],
    ["比", "比较适合的选择", "Compare suitable choices", "集中比较课程方向、费用和入学安排。", "Compare subject areas, fees, and intake arrangements."],
    ["存", "保存个人规划", "Save your study plan", "记录感兴趣的院校，并继续完成申请准备。", "Save universities that interest you and continue preparing your application."],
  ] as const;
  const steps = [
    ["明确方向", "Define your goals", "确定学历、专业兴趣和目标地区。", "Choose a qualification, subject area, and destination."],
    ["比较院校", "Compare universities", "查看课程、地点与入学安排。", "Review programmes, locations, and intake arrangements."],
    ["准备材料", "Prepare documents", "根据要求整理申请文件。", "Prepare the documents required for your application."],
    ["提交申请", "Submit applications", "跟进申请与录取条件。", "Track applications and offer conditions."],
    ["准备入学", "Prepare to enrol", "完成入学前的各项安排。", "Complete the arrangements needed before enrolment."],
  ] as const;

  return <main id="main" className="public-home">
    <section className="public-home-hero">
      <div className="container public-home-hero-grid">
        <div className="public-home-hero-copy">
          <p className="public-home-kicker">{words(locale, "科学规划 · 科学定位", "Strategic planning · Informed direction")}</p>
          <h1>{words(locale, "全球第一家留学生综合服务平台", "A comprehensive service platform for international students worldwide")}</h1>
          <p>{words(locale, "科学规划留学院校与专业，科学定位留学人生发展。洋豆角提供留学生全周期服务与支持。", "Plan the right university and programme, define your long-term direction, and access UDAJO support throughout your study-abroad journey.")}</p>
          <div className="public-home-actions">
            <Link className="button" href={loginHref}>{words(locale, "登录并开始规划", "Sign in to start planning")}</Link>
            <Link className="button secondary" href={registerHref}>{words(locale, "创建免费账户", "Create a free account")}</Link>
          </div>
          <div className="public-home-levels">
            <strong>{words(locale, "你准备申请哪个阶段？", "What level would you like to study?")}</strong>
            <div>{levels.map(([level, zh, en]) => <Link key={level} href={`/${locale}/login?mode=register&returnTo=${encodeURIComponent(`/${locale}/planning?level=${level}`)}`}>{words(locale, zh, en)}</Link>)}</div>
          </div>
        </div>
        <div className="public-home-campus-grid" aria-label={words(locale, "马来西亚大学校园", "University campuses in Malaysia")}>
          <Image className="public-home-campus-main" src="/universities/campuses/apu-campus.webp" width={1200} height={675} priority alt={words(locale, "亚太科技大学校园", "Asia Pacific University campus")} />
          <Image className="public-home-campus-small public-home-campus-um" src={modernUmCampus} width={600} height={400} alt={words(locale, "马来亚大学现代校园建筑", "Modern University of Malaya campus building")} />
          <Image className="public-home-campus-small public-home-campus-taylors" src="/universities/campuses/taylors-campus.webp" width={1200} height={675} alt={words(locale, "泰莱大学校园", "Taylor's University campus")} />
          <div className="public-home-campus-caption"><strong>{words(locale, "探索马来西亚院校", "Explore Malaysian universities")}</strong><span>{words(locale, "集中查看校园、专业方向与入学信息。", "View campuses, subject areas, and admission information in one place.")}</span></div>
        </div>
      </div>
    </section>

    <section className="public-home-tools" aria-labelledby="public-tools-heading"><div className="container public-home-tools-grid">
      <h2 id="public-tools-heading">{words(locale, "登录后，把选择变成清晰的下一步", "Sign in and turn your choices into clear next steps")}</h2>
      <div className="public-home-tool-list">{tools.map(([icon, zh, en, bodyZh, bodyEn]) => <article key={zh}><span aria-hidden="true">{icon}</span><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></article>)}</div>
    </div></section>

    <section className="container section public-home-universities" aria-labelledby="public-universities-heading">
      <div className="public-home-heading"><h2 id="public-universities-heading">{words(locale, "探索全部合作院校", "Explore all available universities")}</h2><p>{words(locale, `浏览现有的 ${UNIVERSITY_CATALOG.length} 所马来西亚院校。登录后可查看完整资料、比较院校，并保存感兴趣的课程方向。`, `Browse all ${UNIVERSITY_CATALOG.length} Malaysian universities currently available. Sign in to view complete information, compare universities, and save programme interests.`)}</p></div>
      <div className="public-home-school-grid">
        {UNIVERSITY_CATALOG.map(school => {
          const profile = universityProfile(school.id);
          const subjects = locale === "zh" ? profile?.subjectsZh : profile?.subjectsEn;
          const detailPath = `/${locale}/universities/${school.slug}`;
          const detailHref = `/${locale}/login?returnTo=${encodeURIComponent(detailPath)}`;
          return <article className="public-home-school-card" key={school.id}>
            <div className="public-home-school-logo">{school.logoSrc ? <Image src={school.logoSrc} width={180} height={100} alt={words(locale, `${school.nameZh}标志`, `${school.nameEn} logo`)} /> : <span>{school.aliases[0]}</span>}</div>
            <div className="public-home-school-content">
              <div><h3>{locale === "zh" ? school.nameZh : school.nameEn}</h3><p className="public-home-school-secondary">{locale === "zh" ? school.nameEn : school.nameZh}</p></div>
              <p className="public-home-school-location"><span aria-hidden="true">⌖</span>{locale === "zh" ? `${school.cityZh}，${school.countryZh}` : `${school.cityEn}, ${school.countryEn}`} <span aria-label={words(locale, "马来西亚国旗", "Malaysia flag")}>🇲🇾</span></p>
              {subjects?.length ? <div className="public-home-school-subjects">{subjects.slice(0, 3).map(subject => <span key={subject}>{subject}</span>)}</div> : null}
              <p className="public-home-school-status"><span aria-hidden="true">✓</span>{school.programmeStatus === "available" ? words(locale, "课程资料可浏览", "Programme information available") : words(locale, "课程资料正在整理", "Programme information in preparation")}</p>
              <Link className="public-home-school-action" href={detailHref}>{words(locale, "登录查看院校详情", "Sign in to view details")} <span aria-hidden="true">→</span></Link>
            </div>
          </article>;
        })}
      </div>
    </section>

    <section className="public-home-process" aria-labelledby="public-process-heading"><div className="container section">
      <div className="public-home-heading"><h2 id="public-process-heading" className="public-home-process-heading">{locale === "zh" ? <>每一步都清楚<br />下一步怎么走</> : "Know what comes next at every stage"}</h2><p>{words(locale, "把分散的申请信息整理成容易理解的路径。", "Follow a clear application journey from initial planning to enrolment.")}</p></div>
      <ol>{steps.map(([zh, en, bodyZh, bodyEn], index) => <li key={zh}><span>{String(index + 1).padStart(2, "0")}</span><h3>{words(locale, zh, en)}</h3><p>{words(locale, bodyZh, bodyEn)}</p></li>)}</ol>
    </div></section>

    <section id="enquiry" className="public-home-contact"><div className="container public-home-contact-desk">
      <section className="public-home-enquiry" aria-labelledby="public-enquiry-heading">
          <p className="public-home-kicker">{words(locale, "一对一升学规划", "One-to-one study planning")}</p>
          <h2>{words(locale, "从你的目标开始", "Start with your goals")}</h2>
          <h3 id="public-enquiry-heading">{words(locale, "提交咨询", "Send an enquiry")}</h3>
          <p>{words(locale, "简短填写三项资料，让顾问先了解你的方向。完整资料可在后续沟通时补充。", "Share three brief details so an adviser can understand your direction. You can provide the remaining information later.")}</p>
          <ConsultationForm locale={locale} compact />
      </section>
      <aside className="public-home-contact-summary">
        <div className="public-home-contact-photo"><Image src="/brand/udajo-office.webp" fill sizes="(max-width: 760px) 100vw, 38vw" alt={words(locale, "洋豆角办公室与公司标志", "UDAJO office and company sign")} /></div>
        <div className="public-home-contact-details">
          <h3>{words(locale, "咨询安排", "Enquiry details")}</h3>
          <dl><div><dt>{words(locale, "预计回复", "Expected response")}</dt><dd>{words(locale, companyProfile.responseTime.zh, companyProfile.responseTime.en)}</dd></div><div><dt>{words(locale, "联系邮箱", "Email")}</dt><dd><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></dd></div><div><dt>{words(locale, "电话", "Telephone")}</dt><dd><a href={contactTelephoneHref(malaysiaAdviser)}>{malaysiaAdviser.phone}</a></dd></div></dl>
          <Link className="public-home-contact-action" href={`/${locale}/about#contact-directory`}>{words(locale, "查看微信与全部联系方式", "View WeChat and all contact options")} <span aria-hidden="true">→</span></Link>
        </div>
      </aside>
    </div></section>
  </main>;
}
