import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicHome } from "@/components/public-home";
import { SiteChrome } from "@/components/site-chrome";
import { companyProfile } from "@/data/company-profile";
import { chineseBrandMetadata } from "@/lib/brand-metadata";
import { resolvePublicIndexing } from "@/lib/public-indexing";
import { isRequestAuthenticated } from "@/lib/server-auth";

export function generateMetadata(): Metadata {
  const { origin } = resolvePublicIndexing(process.env);
  return {
    title: chineseBrandMetadata.title,
    keywords: chineseBrandMetadata.keywords,
    description: chineseBrandMetadata.description,
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
      title: chineseBrandMetadata.title,
      description: chineseBrandMetadata.description,
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
