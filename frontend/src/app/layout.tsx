import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "洋豆角 | Yangdoujiao",
  description: "洋豆角留学规划与院校查询",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
