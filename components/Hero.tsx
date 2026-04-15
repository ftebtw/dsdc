"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import enMessages from "@/messages/en.json";
import zhMessages from "@/messages/zh.json";

const HERO_DESKTOP_VIDEO_SRC =
  "https://9rjkctzpxtq3g6gf.public.blob.vercel-storage.com/dsdc-cover-video-shorter_2.mp4";
const HERO_MOBILE_VIDEO_SRC = "/videos/hero-mobile.mp4";

export default function Hero() {
  const { locale, t } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackHero = locale === "zh" ? zhMessages.hero : enMessages.hero;
  const tagline = t("hero.tagline");
  const headline = t("hero.headline");
  const subheadline = t("hero.subheadline");

  const hasExpectedHeadlineKeywords =
    locale === "zh"
      ? /辩论|演讲|公共演讲/.test(headline)
      : /debate|public speaking/i.test(headline);

  const resolvedHeadline =
    !headline || headline === "hero.headline" || headline.trim() === tagline.trim() || !hasExpectedHeadlineKeywords
      ? fallbackHero.headline
      : headline;

  const resolvedSubheadline =
    !subheadline || subheadline === "hero.subheadline"
      ? fallbackHero.subheadline
      : subheadline;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = () => {
      // ffmpeg is not installed in this environment. Place the compressed mobile file at
      // /public/videos/hero-mobile.mp4 to enable the smaller mobile asset path below.
      const mobileVariantEnabled = false;
      const nextSrc =
        window.innerWidth < 768 && mobileVariantEnabled
          ? HERO_MOBILE_VIDEO_SRC
          : HERO_DESKTOP_VIDEO_SRC;

      const playVideo = () => {
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {
            // Ignore autoplay interruptions; the poster image remains visible.
          });
        }
      };

      video.src = nextSrc;
      video.load();
      video.addEventListener("loadeddata", playVideo, { once: true });
    };

    const timer = window.setTimeout(loadVideo, 1000);

    return () => {
      window.clearTimeout(timer);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Preload the hero poster as the LCP candidate before the video loads */}
      <link
        rel="preload"
        as="image"
        href="/images/photos/wsc-group-2.jpg"
        // @ts-expect-error fetchPriority is a valid HTML attribute not yet in React types
        fetchpriority="high"
      />
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/photos/wsc-group-2.jpg"
        aria-hidden="true"
      >
        Your browser does not support the background video.
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-navy-900/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-base sm:text-lg md:text-xl text-white/90 mb-3 font-semibold">
          {tagline}
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          {resolvedHeadline}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-sans">
          {resolvedSubheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book"
            onClick={() => trackEvent("cta_click", { cta: "book_consultation" })}
            className="px-8 py-4 bg-gold-300 text-navy-900 font-bold text-lg rounded-lg
                       hover:bg-gold-200 transition-all duration-200 shadow-lg hover:shadow-xl
                       hover:-translate-y-0.5"
          >
            {t("hero.cta")}
          </Link>
          <Link
            href="/classes"
            onClick={() => trackEvent("cta_click", { cta: "explore_classes" })}
            className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-lg
                       hover:bg-white hover:text-navy-800 transition-all duration-200"
          >
            {t("hero.ctaSecondary")}
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-white/60 text-xs font-sans tracking-wider uppercase">
          {t("hero.scrollHint")}
        </span>
        <div className="animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/60" />
        </div>
      </div>
    </section>
  );
}
