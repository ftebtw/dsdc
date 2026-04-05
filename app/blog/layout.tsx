import type { Metadata } from "next";
import { buildLocalizedPageMetadata } from "@/lib/pageMetadata";
import { getRequestLocale } from "@/lib/requestLocale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildLocalizedPageMetadata({
    path: "/blog",
    title: locale === "zh" ? "DSDC 博客 | 辩论与公共演讲学习资源" : "Debate & Public Speaking Tips | Blog | DSDC",
    description:
      locale === "zh"
        ? "浏览 DSDC 的中文博客，了解辩论课程、公共演讲训练、比赛准备、家长选课建议和加拿大辩论学习路径。"
        : "Expert insights on debate strategy, public speaking, tournament preparation, and education from DSDC's award-winning coaching team.",
    images: [
      {
        url: "/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC Online Debate Classes",
      },
    ],
    hasChineseVersion: true,
  });
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
