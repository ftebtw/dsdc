import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Script from "next/script";

import { getCmsMessageOverrides } from "@/lib/sanity/content";
import JsonLd from "@/components/JsonLd";
import { addZhPrefix, hasChineseVersion } from "@/lib/localeRouting";
import { buildBreadcrumbSchema, localBusinessSchema, websiteSchema } from "@/lib/structuredData";
import { getBlogPostsSync } from "@/lib/blogPosts";
import { DM_Sans, Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ClientProviders from "./providers";
import VisualEditingWrapper from "@/components/VisualEditingWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DSDC | Debate & Public Speaking Classes for Kids",
    template: "%s",
  },
  description:
    "DSDC offers online debate and public speaking classes for kids in Vancouver and across Canada, with expert coaching and personalized feedback.",
  keywords: [
    "debate classes Vancouver",
    "public speaking for kids BC",
    "online debate coaching Canada",
    "debate school Surrey",
    "World Scholar's Cup preparation",
    "debate classes for kids",
    "public speaking classes online",
    "DSDC",
    "youth debate training",
  ],
  openGraph: {
    title: "DSDC | Debate & Public Speaking Classes for Kids",
    description:
      "DSDC offers online debate and public speaking classes for kids in Vancouver and across Canada, with expert coaching and personalized feedback.",
    url: "https://dsdc.ca",
    siteName: "DSDC",
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
        width: 1200,
        height: 630,
        alt: "DSDC - Online Debate and Public Speaking Classes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSDC | Debate & Public Speaking Classes for Kids",
    description:
      "DSDC offers online debate and public speaking classes for kids in Vancouver and across Canada, with expert coaching and personalized feedback.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://dsdc.ca"),
};

const breadcrumbLabelMap: Record<string, string> = {
  about: "About",
  awards: "Awards",
  blog: "Blog",
  book: "Book a Free Consultation",
  cancellation: "Cancellation Policy",
  classes: "Classes",
  compare: "Compare",
  contact: "Contact",
  faq: "FAQ",
  pricing: "Pricing",
  privacy: "Privacy Policy",
  register: "Register",
  team: "Team",
  terms: "Terms",
  "online-debate-classes": "Online Debate Classes",
  "debate-classes-canada": "Debate Classes Canada",
  "debate-classes-calgary": "Debate Classes Calgary",
  "debate-classes-ontario": "Debate Classes Ontario",
  "debate-classes-ottawa": "Debate Classes Ottawa",
  "debate-classes-vancouver": "Debate Classes Vancouver",
  "debate-classes-toronto": "Debate Classes Toronto",
  "debate-classes-alberta": "Debate Classes Alberta",
  "world-scholars-cup-coaching": "World Scholar's Cup Coaching",
  "debate-classes-for-beginners": "Debate Classes for Beginners",
  "public-speaking-classes-for-kids": "Public Speaking Classes for Kids",
  "guide-to-debate-in-canada": "Guide to Debate in Canada",
};

const breadcrumbLabelMapZh: Record<string, string> = {
  about: "关于我们",
  awards: "学生成绩",
  blog: "博客",
  book: "预约咨询",
  cancellation: "退款与取消政策",
  classes: "课程",
  compare: "课程对比",
  contact: "联系我们",
  "debate-classes-toronto": "多伦多辩论课程",
  "debate-classes-vancouver": "温哥华辩论课程",
  faq: "常见问题",
  "online-debate-classes": "在线辩论课程",
  pricing: "课程价格",
  privacy: "隐私政策",
  register: "报名",
  team: "教练团队",
  terms: "服务条款",
};

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getBreadcrumbItems(pathname: string, locale: "en" | "zh") {
  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const homeName = locale === "zh" ? "首页" : "Home";
  const localizePath = (path: string) => (locale === "zh" && hasChineseVersion(path) ? addZhPrefix(path) : path);

  if (cleanPath === "/") {
    return [{ name: homeName, path: localizePath("/") }];
  }

  if (cleanPath.startsWith("/blog/")) {
    const slug = cleanPath.slice("/blog/".length);
    const post = getBlogPostsSync().find((item) => item.slug === slug);
    return [
      { name: homeName, path: localizePath("/") },
      { name: locale === "zh" ? "博客" : "Blog", path: localizePath("/blog") },
      { name: post?.title ?? formatSegment(slug), path: localizePath(cleanPath) },
    ];
  }

  const parts = cleanPath.split("/").filter(Boolean);
  const items = [{ name: homeName, path: localizePath("/") }];

  for (let index = 0; index < parts.length; index += 1) {
    const slug = parts[index];
    const path = `/${parts.slice(0, index + 1).join("/")}`;
    items.push({
      name: locale === "zh" ? breadcrumbLabelMapZh[slug] ?? formatSegment(slug) : breadcrumbLabelMap[slug] ?? formatSegment(slug),
      path: localizePath(path),
    });
  }

  return items;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-dsdc-locale") === "zh" ? "zh" : "en";
  const pathname = requestHeaders.get("x-dsdc-pathname") ?? "/";
  const cmsResult = await getCmsMessageOverrides({ draft: isEnabled });
  const initialCmsOverrides = cmsResult.source === "live" ? cmsResult.overrides : undefined;
  const isSeoPublicPath =
    !pathname.startsWith("/portal") &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/payment") &&
    !pathname.startsWith("/_");
  const englishHref = `https://dsdc.ca${pathname === "/" ? "" : pathname}`;
  const chineseHref = `https://dsdc.ca${addZhPrefix(pathname)}`;
  const breadcrumbSchema = isSeoPublicPath ? buildBreadcrumbSchema(getBreadcrumbItems(pathname, locale)) : null;
  const showChineseAlternate = isSeoPublicPath && hasChineseVersion(pathname);

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} ${dmSans.variable}`}>
      <head>
        {isSeoPublicPath ? <link rel="alternate" hrefLang="en" href={englishHref} /> : null}
        {showChineseAlternate ? <link rel="alternate" hrefLang="zh" href={chineseHref} /> : null}
        {isSeoPublicPath ? <link rel="alternate" hrefLang="x-default" href={englishHref} /> : null}
        <link rel="preconnect" href="https://9rjkctzpxtq3g6gf.public.blob.vercel-storage.com" crossOrigin="" />
        <JsonLd id="site-local-business-schema" data={localBusinessSchema} />
        <JsonLd id="site-website-schema" data={websiteSchema} />
        {breadcrumbSchema ? <JsonLd id="site-breadcrumb-schema" data={breadcrumbSchema} /> : null}
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-navy-800 focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Script
          id="google-ads-script"
          src="https://www.googletagmanager.com/gtag/js?id=AW-390603959"
          strategy="lazyOnload"
        />
        <Script id="google-ads-config" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'AW-390603959');`}
        </Script>
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2316561212086063');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2316561212086063&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <script
          dangerouslySetInnerHTML={{
            __html: 'try{var t=localStorage.getItem("dsdc-theme");var e=document.documentElement;if(t==="dark")e.classList.add("dark");else if(t==="light")e.classList.remove("dark");}catch(n){}',
          }}
        />
        <ClientProviders initialCmsOverrides={initialCmsOverrides} initialLocale={locale}>
          {children}
        </ClientProviders>
        <VisualEditingWrapper enabled={isEnabled} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
