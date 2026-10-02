import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicHome } from "@/components/public-home";
import { SiteChrome } from "@/components/site-chrome";
import { companyProfile } from "@/data/company-profile";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import { isRequestAuthenticated } from "@/lib/server-auth";

const title = "洋豆角留学｜留学规划与院校查询";
const description = "洋豆角留学（洋豆角教育）提供留学院校与专业查询、留学规划、申请咨询及留学全周期服务。";

export function generateMetadata(): Metadata {
  const { origin } = resolvePublicIndexing(process.env);
  return {
    title,
    description,
    alternates: {
      canonical: origin,
      languages: {
        "zh-CN": origin,
        en: `${origin}/en`,
        "x-default": origin,
      },
    },
    openGraph: {
      type: "website",
      url: origin,
      siteName: "洋豆角留学",
      title,
      description,
      locale: "zh_CN",
    },
  };
}

function BrandStructuredData() {
  const { origin } = resolvePublicIndexing(process.env);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: "洋豆角留学",
        alternateName: ["洋豆角教育", "洋豆角", "UDAJO"],
        inLanguage: ["zh-CN", "en"],
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        url: origin,
        name: "洋豆角留学",
        alternateName: ["洋豆角教育", "洋豆角", "UDAJO"],
        legalName: companyProfile.legalNameZh,
        logo: `${origin}/brand/udajo-logo-transparent.png`,
        email: companyProfile.publicEmail,
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  }} />;
}

export default async function Home() {
  const signedIn = await isRequestAuthenticated();
  if (signedIn) redirect("/zh");

  return <SiteChrome locale="zh" signedIn={false}>
    <BrandStructuredData />
    <PublicHome locale="zh" />
  </SiteChrome>;
}
