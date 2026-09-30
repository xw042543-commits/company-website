import Link from "next/link";
import { notFound } from "next/navigation";
import { companyProfile } from "@/data/company-profile";
import { isLocale, words } from "@/lib/site";

const policyDate = "2026-09-30";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <main id="main" className="legal-page">
    <header className="legal-hero">
      <div className="container legal-hero-content">
        <p className="section-label">{words(locale, "隐私与个人信息保护", "Privacy and personal information")}</p>
        <h1>{words(locale, "隐私政策", "Privacy policy")}</h1>
        <p className="page-intro">{words(locale,
          "本政策说明洋豆角账号、微信登录及网站基本功能如何处理个人信息。",
          "This policy explains how UDAJO handles personal information for accounts, WeChat sign-in, and essential website functions.",
        )}</p>
        <p className="legal-version">{words(locale, `版本及生效日期：${policyDate}`, `Version and effective date: ${policyDate}`)}</p>
      </div>
    </header>

    <article className="container legal-content">
      <section>
        <h2>{words(locale, "一、个人信息处理者", "1. Who controls your information")}</h2>
        <dl className="legal-facts">
          <div><dt>{words(locale, "名称", "Legal name")}</dt><dd>{companyProfile.legalNameZh}</dd></div>
          <div><dt>{words(locale, "统一社会信用代码", "Registration number")}</dt><dd>{companyProfile.registrationNumber}</dd></div>
          <div><dt>{words(locale, "官方网站", "Website")}</dt><dd>{companyProfile.domain}</dd></div>
          <div><dt>{words(locale, "隐私联系邮箱", "Privacy contact")}</dt><dd><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></dd></div>
        </dl>
      </section>

      <section>
        <h2>{words(locale, "二、适用范围", "2. Scope")}</h2>
        <p>{words(locale,
          "本政策适用于您访问和使用洋豆角网站，以及使用账号、微信登录和在线咨询等实际开放的功能。某项功能尚未开放时，我们不会通过该功能收集对应信息。留学申请或顾问沟通如需额外资料，我们将在相应页面另行告知并取得必要授权。",
          "This policy applies when you access and use the UDAJO website and any available functions, including accounts, WeChat sign-in, and online enquiries. When a function is not yet available, we do not collect the corresponding information through that function. We will give a separate notice and obtain any required authorisation before collecting additional information for applications or adviser communications.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "三、我们处理的信息", "3. Information we process")}</h2>
        <div className="legal-table-wrap"><table className="legal-table">
          <thead><tr><th>{words(locale, "场景", "Purpose")}</th><th>{words(locale, "信息", "Information")}</th><th>{words(locale, "用途", "Use")}</th><th>{words(locale, "保存", "Retention")}</th></tr></thead>
          <tbody>
            <tr><td>{words(locale, "网站访问", "Website access")}</td><td>{words(locale, "浏览器正常请求所必需的网络和技术信息，以及语言选择", "Network and technical information required for normal browser requests, plus language choice")}</td><td>{words(locale, "显示网页、保障基本安全并记住语言", "Deliver pages, provide basic security, and remember the selected language")}</td><td>{words(locale, "仅在实现目的所需最短期限内保存；依法必须留存的安全日志除外", "Only for the shortest period needed, except security logs that must be retained by law")}</td></tr>
            <tr><td>{words(locale, "账号注册与登录", "Account access")}</td><td>{words(locale, "当您使用该功能时处理邮箱或手机号、验证码、密码摘要、账号标识", "When you use this function: email address or phone number, verification code, password hash, and account ID")}</td><td>{words(locale, "创建账号、验证身份和恢复访问", "Create the account, verify identity, and restore access")}</td><td>{words(locale, "账号存续期间；注销后依法删除或匿名化，法律另有规定的除外", "For the account lifetime, followed by deletion or anonymisation after account deletion unless the law requires otherwise")}</td></tr>
            <tr><td>{words(locale, "微信登录", "WeChat sign-in")}</td><td>{words(locale, "当您选择微信登录时处理微信授权临时代码、OpenID；同一开放平台下可能取得UnionID；仅在您授权且功能需要时获取昵称、头像", "When you choose WeChat sign-in: temporary authorisation code and OpenID, with UnionID potentially available under the same Open Platform account; nickname and avatar only when authorised and needed")}</td><td>{words(locale, "建立或绑定洋豆角账号、完成登录、防止账号冒用", "Create or link an UDAJO account, sign you in, and prevent account misuse")}</td><td>{words(locale, "临时代码使用或过期后不再保留；绑定标识保存至解绑或注销", "Temporary codes are not retained after use or expiry; binding identifiers remain until unlinking or account deletion")}</td></tr>
            <tr><td>{words(locale, "在线咨询", "Online enquiries")}</td><td>{words(locale, "当您提交咨询时处理姓名、手机或微信、意向学校、意向专业、学历层次及您主动填写的备注", "When you submit an enquiry: name, phone number or WeChat ID, intended university and programme, study level, and notes you choose to provide")}</td><td>{words(locale, "回复咨询、了解升学需求并安排顾问沟通", "Respond to the enquiry, understand study needs, and arrange adviser contact")}</td><td>{words(locale, "咨询处理完成后仅在解决后续问题和履行法定义务所需期限内保存，随后删除或匿名化", "After the enquiry is handled, only for as long as needed to resolve follow-up matters and meet legal obligations, followed by deletion or anonymisation")}</td></tr>
            <tr><td>{words(locale, "安全保障", "Security")}</td><td>{words(locale, "登录时间、登录方式、设备与浏览器基本信息、必要的网络和异常记录", "Sign-in time and method, basic device and browser data, and necessary network and anomaly logs")}</td><td>{words(locale, "防止欺诈、攻击和账号盗用，排查故障", "Prevent fraud, attacks, and account takeover, and diagnose faults")}</td><td>{words(locale, "按照实现目的所需最短期限及适用的法定网络日志期限保存", "For the shortest period needed and any applicable statutory network-log period")}</td></tr>
          </tbody>
        </table></div>
        <p>{words(locale,
          "我们不会获取您的微信密码、通讯录或聊天内容。拒绝微信授权不会影响您选择其他可用登录方式。",
          "We do not receive your WeChat password, contacts, or chat content. Refusing WeChat authorisation does not prevent you from using another available sign-in method.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "四、微信登录与第三方处理", "4. WeChat and third-party processing")}</h2>
        <p>{words(locale,
          "微信登录由微信相关运营主体提供。您扫码或跳转至微信授权页面后，微信会按照其规则处理您的微信账号和设备信息；微信向我们返回完成登录所需的授权结果和账号标识。授权页面展示的信息范围与微信当时提供的选项为准。",
          "WeChat sign-in is provided by the relevant WeChat operator. When you scan the code or open the authorisation page, WeChat processes your account and device information under its own rules and returns the authorisation result and identifiers needed for sign-in. The authorisation screen controls the exact scope shown to you.",
        )}</p>
        <p>{words(locale,
          "仅当网站实际提供微信登录且您主动选择该方式时，我们才会向微信发起授权请求。若页面标明该功能尚未开放或仅供预览，则不会取得您的微信账号信息。微信服务主体、共享清单或处理方式发生变化时，我们会及时更新本政策。",
          "We send an authorisation request to WeChat only when WeChat sign-in is actually available and you actively choose it. If the page states that the function is unavailable or for preview only, we do not obtain your WeChat account information. We will update this policy if the WeChat operator, disclosure list, or processing method changes.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "五、共享、委托处理与跨境", "5. Sharing, processors, and transfers")}</h2>
        <p>{words(locale,
          "除完成您选择的登录、履行合同、履行法定义务或获得有效授权外，我们不会向其他个人信息处理者提供您的个人信息。账号验证与密码恢复邮件由 Plus Five Five, Inc. 提供的 Resend 服务受托发送；其处理收件邮箱、邮件主题与正文以及必要的投递记录，仅用于发送和保障账号邮件。其他云托管、短信等受托服务商仅可按照我们的指示处理必要信息，并将在正式接入前列明。",
          "We do not disclose personal information to another controller except to complete the sign-in you choose, perform a contract, meet a legal obligation, or act with valid authorisation. Account-verification and password-recovery emails are delivered by the Resend service provided by Plus Five Five, Inc. It processes the recipient address, email subject and content, and necessary delivery records solely to deliver and protect account emails. Other hosting, SMS, and similar processors may handle only what is necessary under our instructions and will be identified before production use.",
        )}</p>
        <p>{words(locale,
          "如需向中国境外提供个人信息，我们会在传输前告知境外接收方、处理目的、方式、信息种类及权利渠道，并履行适用的单独同意和数据出境程序。",
          "Before transferring personal information outside China, we will identify the overseas recipient, purpose, method, data categories, and rights channel, and complete any separate-consent and transfer procedures that apply.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "六、Cookie及本地存储", "6. Cookies and local storage")}</h2>
        <p>{words(locale,
          "我们使用提供安全防护、登录状态、语言选择和您明确请求功能所需的Cookie或本地存储。页面标明为预览的会员功能仅在您的浏览器中保存本机预览标记，不创建正式账号，也不保存表单输入。接入非必要分析或营销技术前，我们会说明用途并提供适用的选择。",
          "We use cookies or local storage needed for security, sign-in state, language choice, and functions you request. A member function marked as a preview stores only a local preview marker in your browser; it does not create a production account or retain form input. Before adding non-essential analytics or marketing technologies, we will explain their purpose and provide any applicable choice.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "七、您的权利", "7. Your rights")}</h2>
        <p>{words(locale,
          "您可以请求查阅、复制、更正、补充或删除个人信息，撤回同意、解除微信绑定、注销账号，或要求我们解释处理规则。请通过隐私联系邮箱提出请求。为保障账号安全，我们可能核验您的身份，并将在适用法律要求的期限内答复。",
          "You may ask to access, copy, correct, supplement, or delete your information, withdraw consent, unlink WeChat, delete your account, or obtain an explanation of our processing. Contact the privacy email above. We may verify your identity and will respond within the period required by applicable law.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "八、未成年人", "8. Children")}</h2>
        <p>{words(locale,
          "不满十四周岁的用户应在监护人同意和指导下使用服务。处理不满十四周岁未成年人的个人信息前，我们会取得监护人同意并提供专门规则。",
          "Users under 14 must use the service with a guardian’s consent and guidance. Before processing their personal information, we will obtain guardian consent and provide dedicated rules.",
        )}</p>
      </section>

      <section>
        <h2>{words(locale, "九、安全与政策更新", "9. Security and policy updates")}</h2>
        <p>{words(locale,
          "我们采取访问控制、加密传输、权限分级和日志审计等合理措施。处理目的、方式、信息种类或第三方发生重大变化时，我们会以显著方式通知；依法需要重新同意的，将在处理前取得同意。",
          "We use reasonable safeguards including access controls, encrypted transmission, role-based permissions, and audit logs. We will prominently notify you of material changes to purposes, methods, data categories, or third parties, and obtain renewed consent where required.",
        )}</p>
      </section>

      <aside className="legal-note">
        <strong>{words(locale, "联系我们", "Contact us")}</strong>
        <p>{companyProfile.legalNameZh}<br /><a href={`mailto:${companyProfile.publicEmail}`}>{companyProfile.publicEmail}</a></p>
        <Link href={`/${locale}/about#enquiry`}>{words(locale, "查看其他联系方式", "View other contact methods")}</Link>
        <span aria-hidden="true"> · </span>
        <Link href={`/${locale}/terms`}>{words(locale, "用户协议", "User agreement")}</Link>
      </aside>
    </article>
  </main>;
}
