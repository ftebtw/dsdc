import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Script from "next/script";

import { getCmsMessageOverrides } from "@/lib/sanity/content";
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
    default: "DSDC | Online Debate & Public Speaking Classes",
    template: "%s",
  },
  description: "Online debate and public speaking classes from beginner to advanced levels.",
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
    title: "DSDC | Online Debate & Public Speaking Classes",
    description: "Online debate and public speaking classes from beginner to advanced levels.",
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
    title: "DSDC | Online Debate & Public Speaking Classes",
    description: "Online debate and public speaking classes from beginner to advanced levels.",
    images: ["https://dsdc.ca/images/photos/wsc-group-2.jpg"],
  },
  alternates: {
    languages: {
      en: "https://dsdc.ca",
      "x-default": "https://dsdc.ca",
    },
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

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "DSDC - Debate & Speech Development Community",
  url: "https://dsdc.ca",
  logo: "https://dsdc.ca/images/logos/logo-full.png",
  foundingDate: "2017",
  description:
    "Online debate and public speaking classes for kids, teens, and university students. Founded in Vancouver, Canada.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  email: "education.dsdc@gmail.com",
  sameAs: [
    "https://instagram.com/debate_education/",
    "https://www.linkedin.com/company/debate-and-speech-development-community/",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Debate & Speech Development Community",
  alternateName: ["DSDC", "DSDC Debate Academy"],
  url: "https://dsdc.ca",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const cmsResult = await getCmsMessageOverrides({ draft: isEnabled });
  const initialCmsOverrides = cmsResult.source === "live" ? cmsResult.overrides : undefined;
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="alternate" hrefLang="en" href="https://dsdc.ca" />
        <link rel="alternate" hrefLang="x-default" href="https://dsdc.ca" />
        <link rel="preconnect" href="https://9rjkctzpxtq3g6gf.public.blob.vercel-storage.com" crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
        <ClientProviders initialCmsOverrides={initialCmsOverrides}>
          {children}
        </ClientProviders>
        <VisualEditingWrapper enabled={isEnabled} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
