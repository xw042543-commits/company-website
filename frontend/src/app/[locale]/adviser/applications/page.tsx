import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {AdviserApplicationsPanel} from "@/components/adviser-applications-panel";
import {adviserNavigation} from "@/lib/adviser-consultations-ui";
import {isLocale,words} from "@/lib/site";

export const metadata:Metadata={title:"Application management · UDAJO",robots:{index:false,follow:false}};
export default async function AdviserApplicationsPage({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;if(!isLocale(locale))notFound();
 return <main id="main" className="adviser-console"><div className="adviser-console-shell"><header className="adviser-console-header"><Link className="adviser-console-brand" href={`/${locale}`} aria-label={words(locale,"返回洋豆角首页","Return to UDAJO home")}><Image src="/brand/udajo-logo-transparent.png" width={1254} height={1254} sizes="44px" alt=""/><span><strong>UDAJO</strong><small>{words(locale,"顾问后台","Adviser console")}</small></span></Link><nav className="community-navigation adviser-console-navigation" aria-label={words(locale,"顾问导航","Adviser navigation")}>{adviserNavigation(locale).map(item=><Link key={item.href} href={item.href} aria-current={item.href.endsWith("/applications")?"page":undefined}>{item.label}</Link>)}</nav><Link className="button secondary" href={`/${locale}/account`}>{words(locale,"我的账户","My account")}</Link></header><section className="adviser-page-heading"><h1>{words(locale,"申请管理","Application management")}</h1><p>{words(locale,"管理申请进度、学生催办与跟进记录。","Manage application stages, student reminders and follow-up records.")}</p></section><AdviserApplicationsPanel locale={locale}/></div></main>;
}
