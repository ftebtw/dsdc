#!/usr/bin/env node
/**
 * Seeds Sanity with the four singleton CMS documents (Site Settings, Homepage Content,
 * Pricing Page Content, Team Page Content) using content from messages/en.json and messages/zh.json.
 *
 * Requires SANITY_API_WRITE_TOKEN in .env.local (create in Sanity Manage → API → Tokens).
 * Run: node scripts/seed-cms-documents.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env.local
const envPath = join(root, ".env.local");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8").replace(/\r\n/g, "\n");
  for (const line of raw.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (val) process.env[key] = val;
    }
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN are required."
  );
  console.error(
    "Create a token at https://www.sanity.io/manage → Your Project → API → Tokens (Editor or Admin role)."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-02-01",
  token,
  useCdn: false,
});

function loc(en, zh) {
  return { en: en || "", zh: zh || "" };
}

function locArr(en, zh) {
  return {
    en: Array.isArray(en) ? en : [],
    zh: Array.isArray(zh) ? zh : [],
  };
}

function loadJson(name) {
  const p = join(root, "messages", `${name}.json`);
  return JSON.parse(readFileSync(p, "utf8"));
}

const en = loadJson("en");
const zh = loadJson("zh");

async function seed() {
  console.log("Seeding Sanity CMS documents...\n");

  // Site Settings
  const siteSettings = {
    _id: "siteSettings",
    _type: "siteSettings",
    nav: {
      home: loc(en.nav?.home, zh.nav?.home),
      team: loc(en.nav?.team, zh.nav?.team),
      classes: loc(en.nav?.classes, zh.nav?.classes),
      awards: loc(en.nav?.awards, zh.nav?.awards),
      blog: loc(en.nav?.blog, zh.nav?.blog),
      pricing: loc(en.nav?.pricing, zh.nav?.pricing),
      book: loc(en.nav?.book, zh.nav?.book),
      langToggle: loc(en.nav?.langToggle, zh.nav?.langToggle),
    },
    footer: {
      tagline: loc(en.footer?.tagline, zh.footer?.tagline),
      quickLinks: loc(en.footer?.quickLinks, zh.footer?.quickLinks),
      contact: loc(en.footer?.contact, zh.footer?.contact),
      social: loc(en.footer?.social, zh.footer?.social),
      copyright: loc(en.footer?.copyright, zh.footer?.copyright),
      companyEmail: en.footer?.companyEmail || "",
      instagramUrl: en.footer?.instagramUrl || "",
      linkedinUrl: en.footer?.linkedinUrl || "",
    },
  };
  await client.createOrReplace(siteSettings);
  console.log("✓ Site Settings");

  // Homepage Content
  const homePageContent = {
    _id: "homePageContent",
    _type: "homePageContent",
    hero: {
      headline: loc(en.hero?.headline, zh.hero?.headline),
      subheadline: loc(en.hero?.subheadline, zh.hero?.subheadline),
      cta: loc(en.hero?.cta, zh.hero?.cta),
      ctaSecondary: loc(en.hero?.ctaSecondary, zh.hero?.ctaSecondary),
      scrollHint: loc(en.hero?.scrollHint, zh.hero?.scrollHint),
    },
    difference: {
      title: loc(en.difference?.title, zh.difference?.title),
      cards: {
        coaching: {
          title: loc(en.difference?.cards?.coaching?.title, zh.difference?.cards?.coaching?.title),
          description: loc(en.difference?.cards?.coaching?.description, zh.difference?.cards?.coaching?.description),
        },
        attention: {
          title: loc(en.difference?.cards?.attention?.title, zh.difference?.cards?.attention?.title),
          description: loc(en.difference?.cards?.attention?.description, zh.difference?.cards?.attention?.description),
        },
        leadership: {
          title: loc(en.difference?.cards?.leadership?.title, zh.difference?.cards?.leadership?.title),
          description: loc(en.difference?.cards?.leadership?.description, zh.difference?.cards?.leadership?.description),
        },
      },
    },
    howItWorks: {
      title: loc(en.howItWorks?.title, zh.howItWorks?.title),
      subtitle: loc(en.howItWorks?.subtitle, zh.howItWorks?.subtitle),
      steps: (en.howItWorks?.steps || []).map((s, i) => {
        const z = zh.howItWorks?.steps?.[i];
        return {
          _key: `step-${i}`,
          step: s.step || String(i + 1),
          title: loc(s.title, z?.title),
          description: loc(s.description, z?.description),
        };
      }),
    },
    mission: {
      title: loc(en.mission?.title, zh.mission?.title),
      text: loc(en.mission?.text, zh.mission?.text),
      cta: loc(en.mission?.cta, zh.mission?.cta),
    },
    classesOverview: {
      title: loc(en.classesOverview?.title, zh.classesOverview?.title),
      publicSpeaking: {
        title: loc(en.classesOverview?.publicSpeaking?.title, zh.classesOverview?.publicSpeaking?.title),
        description: loc(en.classesOverview?.publicSpeaking?.description, zh.classesOverview?.publicSpeaking?.description),
      },
      debate: {
        title: loc(en.classesOverview?.debate?.title, zh.classesOverview?.debate?.title),
        description: loc(en.classesOverview?.debate?.description, zh.classesOverview?.debate?.description),
      },
      wsc: {
        title: loc(en.classesOverview?.wsc?.title, zh.classesOverview?.wsc?.title),
        description: loc(en.classesOverview?.wsc?.description, zh.classesOverview?.wsc?.description),
      },
      viewAll: loc(en.classesOverview?.viewAll, zh.classesOverview?.viewAll),
      bookCta: loc(en.classesOverview?.bookCta, zh.classesOverview?.bookCta),
    },
    testimonials: {
      title: loc(en.testimonials?.title, zh.testimonials?.title),
      items: (en.testimonials?.items || []).map((item, i) => {
        const zhItem = zh.testimonials?.items?.[i];
        return {
          _key: `t-${i}`,
          name: loc(item.name, zhItem?.name || item.name),
          role: loc(item.role, zhItem?.role || item.role),
          quote: loc(item.quote, zhItem?.quote || item.quote),
        };
      }),
    },
    faq: {
      title: loc(en.faq?.title, zh.faq?.title),
      items: (en.faq?.items || []).map((item, i) => {
        const zhItem = zh.faq?.items?.[i];
        return {
          _key: `q-${i}`,
          q: loc(item.q, zhItem?.q || item.q),
          a: loc(item.a, zhItem?.a || item.a),
        };
      }),
    },
    finalCta: {
      title: loc(en.finalCta?.title, zh.finalCta?.title),
      subtitle: loc(en.finalCta?.subtitle, zh.finalCta?.subtitle),
      cta: loc(en.finalCta?.cta, zh.finalCta?.cta),
      phone: loc(en.finalCta?.phone, zh.finalCta?.phone),
    },
  };
  await client.createOrReplace(homePageContent);
  console.log("✓ Homepage Content");

  // Pricing Page Content
  const p = en.pricingPage || {};
  const pZh = zh.pricingPage || {};
  const pricingPageContent = {
    _id: "pricingPageContent",
    _type: "pricingPageContent",
    pricingPage: {
      title: loc(p.title, pZh.title),
      subtitle: loc(p.subtitle, pZh.subtitle),
      noHiddenFees: loc(p.noHiddenFees, pZh.noHiddenFees),
      groupClasses: loc(p.groupClasses, pZh.groupClasses),
      currency: loc(p.currency, pZh.currency),
      currencyOptions: {
        CAD: loc(p.currencyOptions?.CAD, pZh.currencyOptions?.CAD),
        USD: loc(p.currencyOptions?.USD, pZh.currencyOptions?.USD),
        RMB: loc(p.currencyOptions?.RMB, pZh.currencyOptions?.RMB),
      },
      currencyDisclaimer: loc(p.currencyDisclaimer, pZh.currencyDisclaimer),
      currencyFallback: loc(p.currencyFallback, pZh.currencyFallback),
      privateCoaching: loc(p.privateCoaching, pZh.privateCoaching),
      privateNote: loc(p.privateNote, pZh.privateNote),
      cta: loc(p.cta, pZh.cta),
      ctaSubtext: loc(p.ctaSubtext, pZh.ctaSubtext),
      noviceIntermediate: loc(p.noviceIntermediate, pZh.noviceIntermediate),
      noviceIntermediateDesc: loc(p.noviceIntermediateDesc, pZh.noviceIntermediateDesc),
      publicSpeaking: loc(p.publicSpeaking, pZh.publicSpeaking),
      publicSpeakingDesc: loc(p.publicSpeakingDesc, pZh.publicSpeakingDesc),
      wsc: loc(p.wsc, pZh.wsc),
      wscDesc: loc(p.wscDesc, pZh.wscDesc),
      advanced: loc(p.advanced, pZh.advanced),
      advancedDesc: loc(p.advancedDesc, pZh.advancedDesc),
      private: loc(p.private, pZh.private),
      privateDesc: loc(p.privateDesc, pZh.privateDesc),
      perTerm: loc(p.perTerm, pZh.perTerm),
      termLength: loc(p.termLength, pZh.termLength),
      varies: loc(p.varies, pZh.varies),
      enrollNow: loc(p.enrollNow, pZh.enrollNow),
      paymentCadOnly: loc(p.paymentCadOnly, pZh.paymentCadOnly),
      checkoutLoading: loc(p.checkoutLoading, pZh.checkoutLoading),
      checkoutError: loc(p.checkoutError, pZh.checkoutError),
      contactUs: loc(p.contactUs, pZh.contactUs),
    },
  };
  await client.createOrReplace(pricingPageContent);
  console.log("✓ Pricing Page Content");

  // Team Page Content
  const t = en.teamPage || {};
  const tZh = zh.teamPage || {};
  const coaches = (en.coaches || []).map((c, i) => {
    const cZh = zh.coaches?.[i];
    return {
      _key: `c-${i}`,
      name: c.name,
      title: loc(c.title, cZh?.title || c.title),
      bio: loc(c.bio, cZh?.bio || c.bio),
    };
  });
  const teamPageContent = {
    _id: "teamPageContent",
    _type: "teamPageContent",
    teamPage: {
      title: loc(t.title, tZh.title),
      subtitle: loc(t.subtitle, tZh.subtitle),
      founderName: loc(t.founderName, tZh.founderName),
      founderTitle: loc(t.founderTitle, tZh.founderTitle),
      founderBio: loc(t.founderBio, tZh.founderBio),
      founderKeyAchievements: locArr(t.founderKeyAchievements, tZh.founderKeyAchievements),
      viewAwards: loc(t.viewAwards, tZh.viewAwards),
      hideAwards: loc(t.hideAwards, tZh.hideAwards),
      keyAchievements: loc(t.keyAchievements, tZh.keyAchievements),
      tournament: loc(t.tournament, tZh.tournament),
      year: loc(t.year, tZh.year),
      award: loc(t.award, tZh.award),
    },
    coaches,
  };
  await client.createOrReplace(teamPageContent);
  console.log("✓ Team Page Content");

  // Additional Pages Content
  const competitionsFallback = [
    "Canadian National Debate Championships",
    "US National Debate Championships",
    "World University Debating Championships",
    "Stanford Invitational",
    "Princeton Invitational",
    "World Scholar's Cup - Yale",
    "Oxford Schools Championships",
    "Georgetown Public Forum",
    "UBC Debate Tournaments",
    "SFU Worlds Schools Championships",
    "BC Provincial Championships",
    "Harvard Model United Nations",
  ];

  const additionalPageContent = {
    _id: "additionalPageContent",
    _type: "additionalPageContent",
    stats: {
      students: loc(en.stats?.students, zh.stats?.students),
      studentsValue: loc(en.stats?.studentsValue, zh.stats?.studentsValue),
      years: loc(en.stats?.years, zh.stats?.years),
      yearsValue: loc(en.stats?.yearsValue, zh.stats?.yearsValue),
      wscRate: loc(en.stats?.wscRate, zh.stats?.wscRate),
      wscRateValue: loc(en.stats?.wscRateValue, zh.stats?.wscRateValue),
      coaches: loc(en.stats?.coaches, zh.stats?.coaches),
      coachesValue: loc(en.stats?.coachesValue, zh.stats?.coachesValue),
    },
    competitions: {
      title: loc(en.competitions?.title, zh.competitions?.title),
      subtitle: loc(en.competitions?.subtitle, zh.competitions?.subtitle),
      items: locArr(
        en.competitions?.items?.length ? en.competitions.items : competitionsFallback,
        zh.competitions?.items?.length ? zh.competitions.items : competitionsFallback
      ),
    },
    classesPage: {
      title: loc(en.classesPage?.title, zh.classesPage?.title),
      subtitle: loc(en.classesPage?.subtitle, zh.classesPage?.subtitle),
      online: loc(en.classesPage?.online, zh.classesPage?.online),
      debateTitle: loc(en.classesPage?.debateTitle, zh.classesPage?.debateTitle),
      otherTitle: loc(en.classesPage?.otherTitle, zh.classesPage?.otherTitle),
      typicalClassTitle: loc(en.classesPage?.typicalClassTitle, zh.classesPage?.typicalClassTitle),
      typicalClassItems: (en.classesPage?.typicalClassItems || []).map((item, i) => {
        const zhItem = zh.classesPage?.typicalClassItems?.[i];
        return {
          _key: `tc-${i}`,
          title: loc(item?.title, zhItem?.title),
          description: loc(item?.description, zhItem?.description),
        };
      }),
      pricingNote: loc(en.classesPage?.pricingNote, zh.classesPage?.pricingNote),
      unsure: loc(en.classesPage?.unsure, zh.classesPage?.unsure),
      bookCta: loc(en.classesPage?.bookCta, zh.classesPage?.bookCta),
      classes: (en.classesPage?.classes || []).map((item, i) => {
        const zhItem = zh.classesPage?.classes?.[i];
        return {
          _key: `cl-${i}`,
          name: loc(item?.name, zhItem?.name),
          grades: loc(item?.grades, zhItem?.grades),
          schedule: loc(item?.schedule, zhItem?.schedule),
          category: item?.category || "other",
          description: loc(item?.description, zhItem?.description),
        };
      }),
    },
    bookPage: {
      title: loc(en.bookPage?.title, zh.bookPage?.title),
      subtitle: loc(en.bookPage?.subtitle, zh.bookPage?.subtitle),
      expectTitle: loc(en.bookPage?.expectTitle, zh.bookPage?.expectTitle),
      expectItems: locArr(en.bookPage?.expectItems, zh.bookPage?.expectItems),
      scheduleOnline: loc(en.bookPage?.scheduleOnline, zh.bookPage?.scheduleOnline),
      calendlyWidgetTitle: loc(en.bookPage?.calendlyWidgetTitle, zh.bookPage?.calendlyWidgetTitle),
      calendlyWidgetSubtitle: loc(en.bookPage?.calendlyWidgetSubtitle, zh.bookPage?.calendlyWidgetSubtitle),
      calendlyPlaceholderUrl: loc(en.bookPage?.calendlyPlaceholderUrl, zh.bookPage?.calendlyPlaceholderUrl),
      consultationDuration: loc(en.bookPage?.consultationDuration, zh.bookPage?.consultationDuration),
      consultationMode: loc(en.bookPage?.consultationMode, zh.bookPage?.consultationMode),
      formTitle: loc(en.bookPage?.formTitle, zh.bookPage?.formTitle),
      name: loc(en.bookPage?.name, zh.bookPage?.name),
      email: loc(en.bookPage?.email, zh.bookPage?.email),
      phone: loc(en.bookPage?.phone, zh.bookPage?.phone),
      grade: loc(en.bookPage?.grade, zh.bookPage?.grade),
      gradeOptions: locArr(en.bookPage?.gradeOptions, zh.bookPage?.gradeOptions),
      heardAbout: loc(en.bookPage?.heardAbout, zh.bookPage?.heardAbout),
      heardOptions: locArr(en.bookPage?.heardOptions, zh.bookPage?.heardOptions),
      message: loc(en.bookPage?.message, zh.bookPage?.message),
      submit: loc(en.bookPage?.submit, zh.bookPage?.submit),
      success: loc(en.bookPage?.success, zh.bookPage?.success),
      namePlaceholder: loc(en.bookPage?.namePlaceholder, zh.bookPage?.namePlaceholder),
      emailPlaceholder: loc(en.bookPage?.emailPlaceholder, zh.bookPage?.emailPlaceholder),
      phonePlaceholder: loc(en.bookPage?.phonePlaceholder, zh.bookPage?.phonePlaceholder),
      messagePlaceholder: loc(en.bookPage?.messagePlaceholder, zh.bookPage?.messagePlaceholder),
    },
    awardsPage: {
      title: loc(en.awardsPage?.title, zh.awardsPage?.title),
      subtitle: loc(en.awardsPage?.subtitle, zh.awardsPage?.subtitle),
      debateTitle: loc(en.awardsPage?.debateTitle, zh.awardsPage?.debateTitle),
      wscTitle: loc(en.awardsPage?.wscTitle, zh.awardsPage?.wscTitle),
      viewAll: loc(en.awardsPage?.viewAll, zh.awardsPage?.viewAll),
      showLess: loc(en.awardsPage?.showLess, zh.awardsPage?.showLess),
      moreSuffix: loc(en.awardsPage?.moreSuffix, zh.awardsPage?.moreSuffix),
    },
    blog: {
      title: loc(en.blog?.title, zh.blog?.title),
      subtitle: loc(en.blog?.subtitle, zh.blog?.subtitle),
      allPosts: loc(en.blog?.allPosts, zh.blog?.allPosts),
      relatedPosts: loc(en.blog?.relatedPosts, zh.blog?.relatedPosts),
      readArticle: loc(en.blog?.readArticle, zh.blog?.readArticle),
      read: loc(en.blog?.read, zh.blog?.read),
      backToBlog: loc(en.blog?.backToBlog, zh.blog?.backToBlog),
      readyTitle: loc(en.blog?.readyTitle, zh.blog?.readyTitle),
      readySubtitle: loc(en.blog?.readySubtitle, zh.blog?.readySubtitle),
    },
    paymentSuccess: {
      title: loc(en.paymentSuccess?.title, zh.paymentSuccess?.title),
      subtitle: loc(en.paymentSuccess?.subtitle, zh.paymentSuccess?.subtitle),
      amountPaid: loc(en.paymentSuccess?.amountPaid, zh.paymentSuccess?.amountPaid),
      classTier: loc(en.paymentSuccess?.classTier, zh.paymentSuccess?.classTier),
      receipt: loc(en.paymentSuccess?.receipt, zh.paymentSuccess?.receipt),
      backHome: loc(en.paymentSuccess?.backHome, zh.paymentSuccess?.backHome),
    },
  };
  await client.createOrReplace(additionalPageContent);
  console.log("OK Additional Pages Content");

  console.log("\nDone! All singleton documents have been created/updated. Publish them in Studio to go live.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
