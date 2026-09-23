import Image from "next/image";

import { contactTelephoneHref, PublicAdviser } from "@/data/company-profile";
import { Locale, words } from "@/lib/site";

export function CompanyContacts({
  locale,
  advisers,
  title,
  introduction,
}: {
  locale: Locale;
  advisers: PublicAdviser[];
  title: string;
  introduction?: string;
}) {
  return <section className="contact-directory" aria-labelledby="contact-directory-title">
    <div className="section-heading contact-directory-heading">
      <p className="section-label">{words(locale, "官方联系方式", "Official contacts")}</p>
      <h2 id="contact-directory-title">{title}</h2>
      {introduction && <p>{introduction}</p>}
    </div>
    <div className="contact-card-grid">
      {advisers.map((adviser) => <article className="contact-card" key={adviser.id}>
        <div className="contact-card-copy">
          <p className="contact-region">{adviser.region === "MY"
            ? words(locale, "马来西亚", "Malaysia")
            : words(locale, "中国", "China")}</p>
          <h3>{adviser.name}</h3>
          <p>{words(locale, adviser.role.zh, adviser.role.en)}</p>
          <dl className="contact-methods">
            <div><dt>{words(locale, "电话", "Phone")}</dt><dd><a href={contactTelephoneHref(adviser)}>{adviser.phone}</a></dd></div>
            {adviser.email && <div><dt>{words(locale, "邮箱", "Email")}</dt><dd><a href={`mailto:${adviser.email}`}>{adviser.email}</a></dd></div>}
            {adviser.wechatId && <div><dt>{words(locale, "微信", "WeChat")}</dt><dd>{adviser.wechatId}</dd></div>}
          </dl>
        </div>
        {adviser.qrImage && adviser.qrWidth && adviser.qrHeight && <figure className="contact-qr">
          <Image
            src={adviser.qrImage}
            alt={words(locale, `${adviser.name}微信二维码`, `${adviser.name} WeChat QR code`)}
            width={adviser.qrWidth}
            height={adviser.qrHeight}
            sizes="(max-width: 520px) 72vw, 220px"
          />
          <figcaption>{words(locale, "扫码添加顾问", "Scan to add the adviser")}</figcaption>
        </figure>}
      </article>)}
    </div>
  </section>;
}
