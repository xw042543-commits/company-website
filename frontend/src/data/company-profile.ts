export type PublicAdviser = {
  id: string;
  name: string;
  role: { zh: string; en: string };
  region: "MY" | "CN";
  phone: string;
  email?: string;
  wechatId?: string;
  qrImage?: string;
  qrWidth?: number;
  qrHeight?: number;
};

export function contactTelephoneHref(adviser: Pick<PublicAdviser, "region" | "phone">): string {
  const digits = adviser.phone.replace(/\D/g, "");
  return adviser.region === "MY"
    ? `tel:+60${digits.replace(/^0/, "")}`
    : `tel:+86${digits}`;
}

export const companyProfile = {
  brandNameZh: "洋豆角",
  brandNameEn: "UDAJO",
  legalNameZh: "洋豆角教育科技（山东）有限公司",
  registrationNumber: "91371700MADNR7DM05",
  domain: "yangdoujiao.com",
  publicEmail: "bertram@staff.udajo.com",
  responseTime: {
    zh: "1 个工作日内",
    en: "within one working day",
  },
  addressSourceUrl: "https://mp.weixin.qq.com/s/JL-pFVpL1zHacV9JEUIfyQ",
  serviceLines: [
    { zh: "留学申请与院校规划", en: "Study applications and university planning" },
    { zh: "语言学习与考试准备", en: "Language learning and test preparation" },
    { zh: "课程辅导与学习支持", en: "Tutoring and learning support" },
  ],
} as const;

export const applicationLevelLabel = {
  zh: "计划申请的学历层次",
  en: "Level you plan to apply for",
} as const;

export const publicAdvisers: PublicAdviser[] = [
  {
    id: "chen",
    name: "陈老师",
    role: { zh: "国际项目负责人", en: "International programmes lead" },
    region: "MY",
    phone: "01136514236",
    email: "bertram@staff.udajo.com",
  },
  {
    id: "du",
    name: "杜老师",
    role: { zh: "顾问老师", en: "Education adviser" },
    region: "CN",
    phone: "15589983056",
    wechatId: "udajo002",
    qrImage: "/company/advisers/du-wechat.jpeg",
    qrWidth: 345,
    qrHeight: 473,
  },
  {
    id: "gao",
    name: "高老师",
    role: { zh: "顾问老师", en: "Education adviser" },
    region: "CN",
    phone: "15589913695",
    wechatId: "udajo005",
    qrImage: "/company/advisers/gao-wechat.png",
    qrWidth: 341,
    qrHeight: 468,
  },
  {
    id: "xie",
    name: "谢老师",
    role: { zh: "顾问老师", en: "Education adviser" },
    region: "CN",
    phone: "15508655975",
    wechatId: "udajo006",
    qrImage: "/company/advisers/xie-wechat.png",
    qrWidth: 324,
    qrHeight: 483,
  },
];
