import Link from "next/link";
import { notFound } from "next/navigation";
import { companyProfile } from "@/data/company-profile";
import { isLocale, words } from "@/lib/site";

const agreementDate = "2026-09-30";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="legal-page">
    <header className="legal-hero">
      <div className="container legal-hero-content">
        <p className="section-label">{words(locale, "服务规则与用户责任", "Service rules and user responsibilities")}</p>
        <h1>{words(locale, "用户协议", "User agreement")}</h1>
        <p className="page-intro">{words(locale,
          "本协议说明您访问和使用洋豆角网站时，双方的基本权利、责任与服务边界。",
          "This agreement explains the basic rights, responsibilities, and service boundaries that apply when you access and use the UDAJO website.",
        )}</p>
        <p className="legal-version">{words(locale, `版本及生效日期：${agreementDate}`, `Version and effective date: ${agreementDate}`)}</p>
      </div>
    </header>

    <article className="container legal-content">
      <section>
        <h2>{words(locale, "一、协议主体与接受", "1. Parties and acceptance")}</h2>
        <p>{words(locale,
          `本网站由${companyProfile.legalNameZh}（品牌“${companyProfile.brandNameZh} / ${companyProfile.brandNameEn}”）运营。您访问或浏览网站，应遵守本协议中适用于一般访问的条款；当您注册账号、提交咨询或购买服务时，我们将请您主动确认本协议及其他适用规则。若您不同意，请停止使用相应功能。`,
          `This website is operated by ${companyProfile.legalNameZh} under the ${companyProfile.brandNameEn} / ${companyProfile.brandNameZh} brand. General-access terms apply when you visit or browse the website. When you register, submit an enquiry, or purchase a service, we will ask you to affirmatively accept this agreement and any other applicable rules. If you do not agree, stop using the relevant function.`,
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "二、服务内容与边界", "2. Services and boundaries")}</h2>
        <ul>
          <li>{words(locale, "网站提供院校、专业、语言、奖学金、留学项目、新闻及规划等信息展示与检索功能。", "The website displays and searches information about universities, programmes, languages, scholarships, study projects, news, and planning.")}</li>
          <li>{words(locale, "网站信息用于一般参考，不构成录取、签证、奖学金、就业或其他结果保证，也不替代院校、考试机构、使领馆或主管部门的正式信息。", "Website information is for general reference. It does not guarantee admission, visas, scholarships, employment, or any other outcome, and does not replace official information from universities, examination bodies, diplomatic missions, or authorities.")}</li>
          <li>{words(locale, "院校要求、费用、课程、入学时间和政策可能变化。作出申请或付款决定前，您应核对相关机构的最新正式材料。", "University requirements, fees, programmes, intakes, and policies may change. Before applying or paying, you should check the latest official materials from the relevant institution.")}</li>
          <li>{words(locale, "具体咨询、申请或付费服务的范围、费用、退款及双方责任，以届时另行确认的服务合同或订单为准。", "The scope, fees, refunds, and responsibilities for specific consultancy, application, or paid services will be governed by the separately confirmed service contract or order.")}</li>
        </ul>
      </section>

      <section>
        <h2>{words(locale, "三、账号规则", "3. Account rules")}</h2>
        <p>{words(locale,
          "您应提供合法、真实且属于您本人或经合法授权使用的注册信息，妥善保管登录凭证，并及时更新变更信息。不得转让、出租、出售账号，或冒用他人身份。发现未经授权使用时，请立即联系我们。因平台安全原因，我们可以要求合理的身份核验、临时限制高风险操作，并及时处理账号安全问题。",
          "You must provide lawful and accurate registration information belonging to you or used with lawful authority, protect your credentials, and keep information current. You may not transfer, rent, sell, or impersonate another person through an account. Contact us promptly if you discover unauthorised use. For platform security, we may require reasonable identity verification, temporarily restrict high-risk activity, and address account-security issues.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "四、使用规范", "4. Acceptable use")}</h2>
        <p>{words(locale, "您不得利用本网站从事下列行为：", "You must not use the website to:")}</p>
        <ul>
          <li>{words(locale, "违反法律法规、侵害他人合法权益或发布虚假、违法、有害内容；", "break the law, infringe another person’s rights, or publish false, unlawful, or harmful content;")}</li>
          <li>{words(locale, "未经授权访问账号、接口、数据库或其他系统，绕过访问控制，干扰网站正常运行；", "access accounts, APIs, databases, or systems without authorisation, bypass controls, or disrupt normal operation;")}</li>
          <li>{words(locale, "传播恶意程序，实施欺诈、攻击、批量滥用、自动化抓取或给服务造成不合理负担；", "distribute malware, commit fraud or attacks, conduct bulk abuse or unauthorised automated scraping, or impose an unreasonable load on the service;")}</li>
          <li>{words(locale, "未经许可复制、出售或商业化使用网站内容，或删除权利标识。", "copy, sell, or commercially exploit website content without permission, or remove rights notices.")}</li>
        </ul>
      </section>

      <section>
        <h2>{words(locale, "五、知识产权", "5. Intellectual property")}</h2>
        <p>{words(locale,
          "网站自主制作的文字、界面、程序、标识和其他内容所涉及的权利归洋豆角或相应权利人所有。院校名称、商标及第三方资料归各自权利人所有，仅按说明或信息展示所需使用。未经授权，您不得超出个人、非商业的正常浏览范围使用相关内容。",
          "Rights in original website text, interfaces, software, branding, and other materials belong to UDAJO or the relevant rights holder. University names, trademarks, and third-party materials belong to their respective owners and are used only as needed for identification or information display. Without permission, you may not use such content beyond normal personal, non-commercial browsing.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "六、个人信息保护", "6. Personal information")}</h2>
        <p>{words(locale,
          "我们依照《隐私政策》处理个人信息。我们仅在相关功能实际开放且您主动使用时处理必要信息；页面标明为尚未开放或预览的功能，不会通过该功能收集或保存您的表单输入。处理目的、信息种类、保存期限或第三方情况发生重大变化时，我们会依法告知并提供适用的选择。",
          "We process personal information under the Privacy Policy. We process necessary information only when a function is actually available and you actively use it. A function marked as unavailable or as a preview does not collect or retain your form input through that function. We will give legally required notice and choices when purposes, data categories, retention, or third-party arrangements materially change.",
        )}</p>
        <Link href={`/${locale}/privacy`}>{words(locale, "查看隐私政策", "Read the privacy policy")}</Link>
      </section>

      <section>
        <h2>{words(locale, "七、服务变更、中断与终止", "7. Changes, interruption, and termination")}</h2>
        <p>{words(locale,
          "我们可能因维护、安全、功能调整、不可抗力或法律要求变更或暂停部分服务，并在合理可行范围内提前提示。对于严重违反本协议、危害系统安全或侵害他人权益的行为，我们可以采取警告、限制功能或终止服务等与风险相称的措施，并为申诉或说明提供合理渠道。",
          "We may change or suspend parts of the service for maintenance, security, feature changes, force majeure, or legal requirements, with advance notice where reasonably practicable. For serious breaches, security threats, or infringement of others’ rights, we may take proportionate steps such as warnings, feature restrictions, or termination, while providing a reasonable channel for explanation or appeal.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "八、责任说明", "8. Responsibility")}</h2>
        <p>{words(locale,
          "我们会在合理范围内维护网站信息和运行安全，但不对第三方网站、第三方服务或相关机构自行发布和变更的内容负责。任何依法不能排除或限制的消费者权利、人身损害责任，以及因故意或重大过失造成的责任，不受本协议中的责任限制影响。",
          "We take reasonable steps to maintain website information and operational security, but are not responsible for third-party websites, services, or content independently published or changed by relevant institutions. Nothing in this agreement excludes or limits non-waivable consumer rights, liability for personal injury, or liability arising from wilful misconduct or gross negligence.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "九、协议更新", "9. Agreement updates")}</h2>
        <p>{words(locale,
          "我们可能因功能、业务或法律变化更新本协议。重大变更会以页面提示或其他合理方式通知；依法需要重新取得同意的，我们会在相关变更生效前征得同意。更新后的协议不会不合理地追溯适用于更新前已经完成的行为。",
          "We may update this agreement when functions, business operations, or laws change. We will notify you of material changes through a page notice or another reasonable method and obtain renewed consent before the change takes effect where required. Updated terms will not be unreasonably applied retrospectively to completed conduct.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "十、适用法律与争议处理", "10. Governing law and disputes")}</h2>
        <p>{words(locale,
          "本协议适用中华人民共和国大陆地区法律。发生争议时，双方应先友好协商；协商不成的，可依法向有管辖权的人民法院提起诉讼。消费者还可以通过适用的消费者投诉或其他法定渠道解决争议。",
          "This agreement is governed by the laws of mainland China. The parties should first try to resolve disputes through good-faith discussion; if that fails, either party may bring proceedings before a court with lawful jurisdiction. Consumers may also use applicable consumer-complaint or other statutory channels.",
        )}</p>
      </section>

      <aside className="legal-note">
        <strong>{words(locale, "联系我们", "Contact us")}</strong>
        <p>{companyProfile.legalNameZh}<br />{words(locale, "统一社会信用代码：", "Registration number: ")}{companyProfile.registrationNumber}<br /><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></p>
        <Link href={`/${locale}/about#enquiry`}>{words(locale, "查看其他联系方式", "View other contact methods")}</Link>
        <span aria-hidden="true"> · </span>
        <Link href={`/${locale}/privacy`}>{words(locale, "隐私政策", "Privacy policy")}</Link>
      </aside>
    </article>
  </main>;
}
