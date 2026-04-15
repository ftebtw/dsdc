import { DSDC_CONTACT_EMAIL } from "@/lib/constants";
import { coachImages } from "@/lib/coachImages";
import type { ArticleAuthorProfile, ArticleCitation, BlogPost } from "@/lib/blogPosts";

export const SITE_URL = "https://dsdc.ca";
export const SITE_NAME = "DSDC";
export const SITE_FULL_NAME = "Debate & Speech Development Community";
export const SITE_LOGO_PATH = "/images/logos/logo-full.png";
export const SITE_OG_IMAGE_PATH = "/images/photos/wsc-group-2.jpg";
export const HERO_VIDEO_URL =
  "https://9rjkctzpxtq3g6gf.public.blob.vercel-storage.com/dsdc-cover-video-shorter_2.mp4";

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_LOGO_URL = absoluteUrl(SITE_LOGO_PATH);
export const SITE_OG_IMAGE_URL = absoluteUrl(SITE_OG_IMAGE_PATH);

export const founderAuthorProfile: ArticleAuthorProfile = {
  name: "Rebecca Amisano",
  slug: "rebecca-amisano",
  url: `${SITE_URL}/team#rebecca-amisano`,
  affiliation: "DSDC",
  title: "Head Coach & Founder",
  credential: "Canadian Nationals Grand Finalist; US Nationals Quarterfinalist",
  description:
    "Rebecca founded DSDC in 2017 and has coached more than 1,000 students in debate and public speaking.",
  image: absoluteUrl(coachImages["Rebecca Amisano"]),
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_FULL_NAME,
  alternateName: ["DSDC", "DSDC Debate Academy"],
  additionalType: "https://schema.org/EducationalOrganization",
  url: SITE_URL,
  logo: SITE_LOGO_URL,
  image: SITE_OG_IMAGE_URL,
  description:
    "Online debate and public speaking classes founded in Vancouver, Canada for students in Grades 4 through 12 and beyond.",
  foundingDate: "2017",
  email: DSDC_CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  areaServed: [
    "Canada",
    "Vancouver",
    "Burnaby",
    "Surrey",
    "Richmond",
    "Coquitlam",
    "New Westminster",
    "North Vancouver",
    "West Vancouver",
    "Langley",
    "Delta",
    "White Rock",
    "Abbotsford",
    "Maple Ridge",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: DSDC_CONTACT_EMAIL,
      areaServed: "CA",
      availableLanguage: ["en", "zh"],
    },
  ],
  priceRange: "$$",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    bestRating: "5",
    ratingCount: "3",
    reviewCount: "3",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Angela M." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "DSDC has been my home for debate ever since I started three years ago. I've seen myself visibly improve in confidence and critical thinking.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Ryland C." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "The coaches always provide thoughtful feedback and put real effort into developing lessons with student growth in mind.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Daniel W." },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "The environment at DSDC is simply wonderful. The teachers are supportive of every individual student and are passionate about developing young minds.",
    },
  ],
  sameAs: [
    "https://instagram.com/debate_education/",
    "https://www.linkedin.com/company/debate-and-speech-development-community/",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_FULL_NAME,
  alternateName: ["DSDC", "DSDC Debate Academy"],
  url: SITE_URL,
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
};

export const heroVideoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "DSDC online debate and public speaking hero video",
  description:
    "A short homepage video introducing DSDC's online debate and public speaking classes for students in Canada and around the world.",
  thumbnailUrl: [SITE_OG_IMAGE_URL],
  uploadDate: "2026-02-22",
  duration: "PT6.7S",
  contentUrl: HERO_VIDEO_URL,
  embedUrl: SITE_URL,
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
};

export function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildPersonSchema(author: ArticleAuthorProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: author.url,
    image: author.image,
    jobTitle: author.title,
    description: author.description,
    affiliation: {
      "@id": `${SITE_URL}/#organization`,
    },
    worksFor: {
      "@id": `${SITE_URL}/#organization`,
    },
    credential: author.credential,
  };
}

function slugifyFragment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCoachPersonSchema(coach: {
  name: string;
  title: string;
  bio: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.name,
    url: `${SITE_URL}/team#${slugifyFragment(coach.name)}`,
    ...(coach.image ? { image: absoluteUrl(coach.image) } : {}),
    jobTitle: coach.title,
    description: coach.bio,
    affiliation: {
      "@id": `${SITE_URL}/#organization`,
    },
    worksFor: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

function buildCitationSchema(citation: ArticleCitation) {
  return {
    "@type": "CreativeWork",
    name: citation.title,
    url: citation.url,
    ...(citation.publisher
      ? {
          publisher: {
            "@type": "Organization",
            name: citation.publisher,
          },
        }
      : {}),
    ...(citation.datePublished ? { datePublished: citation.datePublished } : {}),
  };
}

export function buildArticleSchema(post: BlogPost, path: string, locale: "en" | "zh" = "en") {
  const datePublished = post.publishedAt ?? post.date;
  const dateModified = post.updatedAt ?? datePublished;
  const author = post.authorProfile ?? founderAuthorProfile;
  const articleImage = post.mainImage ? absoluteUrl(post.mainImage) : SITE_OG_IMAGE_URL;

  return {
    "@context": "https://schema.org",
    "@type": post.schemaType ?? "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished,
    dateModified,
    inLanguage: locale === "zh" ? "zh-Hans" : "en-CA",
    articleSection: post.category,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
      image: author.image,
      jobTitle: author.title,
      affiliation: {
        "@id": `${SITE_URL}/#organization`,
      },
      credential: author.credential,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_FULL_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
    image: [articleImage],
    ...(post.citationSources?.length
      ? {
          citation: post.citationSources.map(buildCitationSchema),
        }
      : {}),
  };
}
