import type { ArticleAuthorProfile, ArticleCitation, BlogPost, BlogSection } from "@/lib/blogPosts";
import { founderAuthorProfile } from "@/lib/structuredData";

type ArticleEnhancement = {
  authorProfile?: ArticleAuthorProfile;
  citationSources?: ArticleCitation[];
  schemaType?: "Article" | "BlogPosting";
  insertedSections?: Array<{
    afterSectionIndex: number;
    section: BlogSection;
  }>;
};

const articleEnhancements: Record<string, ArticleEnhancement> = {
  "guide-to-debate-in-canada": {
    authorProfile: founderAuthorProfile,
    schemaType: "Article",
    citationSources: [
      {
        title: "Canadian Student Debating Federation",
        url: "https://www.csdf-fcde.ca/",
        publisher: "Canadian Student Debating Federation",
      },
      {
        title: "Join DSABC",
        url: "https://www.bcdebate.ca/aboutus/join",
        publisher: "Debate and Speech Association of British Columbia",
      },
      {
        title: "World Schools Debating Championships",
        url: "https://wsdcdebating.org/",
        publisher: "World Schools Debating Championships",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 1,
        section: {
          type: "paragraph",
          content:
            'Families can verify the national pathway directly through <cite href="https://www.csdf-fcde.ca/">the Canadian Student Debating Federation</cite> and <cite href="https://www.bcdebate.ca/aboutus/join">the Debate and Speech Association of British Columbia</cite>, both of which outline how local participation connects to provincial and national competition.',
        },
      },
    ],
  },
  "debate-classes-cost": {
    authorProfile: founderAuthorProfile,
    citationSources: [
      {
        title: "Drip pricing",
        url: "https://competition-bureau.canada.ca/en/deceptive-marketing-practices/drip-pricing",
        publisher: "Competition Bureau Canada",
      },
      {
        title: "Junk fees",
        url: "https://ised-isde.canada.ca/site/office-consumer-affairs/en/business-practices-and-consumer-concerns/junk-fees",
        publisher: "Office of Consumer Affairs Canada",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 0,
        section: {
          type: "paragraph",
          content:
            'Transparent pricing matters. <cite href="https://competition-bureau.canada.ca/en/deceptive-marketing-practices/drip-pricing">The Competition Bureau of Canada</cite> warns that hidden mandatory fees can mislead consumers, and <cite href="https://ised-isde.canada.ca/site/office-consumer-affairs/en/business-practices-and-consumer-concerns/junk-fees">the Office of Consumer Affairs</cite> notes that upfront pricing helps families compare options more fairly.',
        },
      },
    ],
  },
  "qualify-canadian-nationals": {
    authorProfile: founderAuthorProfile,
    citationSources: [
      {
        title: "Canadian Student Debating Federation",
        url: "https://www.csdf-fcde.ca/",
        publisher: "Canadian Student Debating Federation",
      },
      {
        title: "Join DSABC",
        url: "https://www.bcdebate.ca/aboutus/join",
        publisher: "Debate and Speech Association of British Columbia",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 0,
        section: {
          type: "paragraph",
          content:
            'The exact qualification route varies by province, but <cite href="https://www.csdf-fcde.ca/">the Canadian Student Debating Federation</cite> confirms that national championships are fed by provincial organizations, and <cite href="https://www.bcdebate.ca/aboutus/join">the Debate and Speech Association of British Columbia</cite> explains how BC students progress from regional tournaments to provincials.',
        },
      },
    ],
  },
  "canadian-debate-formats": {
    authorProfile: founderAuthorProfile,
    citationSources: [
      {
        title: "Canadian Student Debating Federation",
        url: "https://www.csdf-fcde.ca/",
        publisher: "Canadian Student Debating Federation",
      },
      {
        title: "WUDC British Parliamentary Rules",
        url: "https://wudc.org/resources/rules",
        publisher: "World Universities Debating Council",
      },
      {
        title: "World Schools Debating Championships",
        url: "https://wsdcdebating.org/",
        publisher: "World Schools Debating Championships",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 0,
        section: {
          type: "paragraph",
          content:
            'For families comparing formats, <cite href="https://wudc.org/resources/rules">the World Universities Debating Championship rules</cite> define the British Parliamentary standard, <cite href="https://wsdcdebating.org/">World Schools Debating Championships</cite> publishes the international schools format, and <cite href="https://www.csdf-fcde.ca/">the Canadian Student Debating Federation</cite> coordinates Canada\'s national pathway.',
        },
      },
    ],
  },
  "world-scholars-cup": {
    authorProfile: founderAuthorProfile,
    citationSources: [
      {
        title: "Global Rounds",
        url: "https://www.scholarscup.org/global-rounds",
        publisher: "World Scholar's Cup",
      },
      {
        title: "Tournament of Champions",
        url: "https://www.scholarscup.org/toc",
        publisher: "World Scholar's Cup",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 1,
        section: {
          type: "paragraph",
          content:
            'The official <cite href="https://www.scholarscup.org/global-rounds">World Scholar\'s Cup Global Rounds overview</cite> explains the regional-to-global pathway, and <cite href="https://www.scholarscup.org/toc">the Tournament of Champions page</cite> confirms the Yale-hosted final stage that many families aim for.',
        },
      },
    ],
  },
  "effective-study-techniques": {
    authorProfile: founderAuthorProfile,
    citationSources: [
      {
        title: "Active Recall: Test Yourself for Better Retention",
        url: "https://tutor.umn.edu/active-recall-test-yourself-better-retention",
        publisher: "University of Minnesota",
      },
      {
        title: "The Spacing Effect",
        url: "https://cft.vanderbilt.edu/guides-sub-pages/spacing-effect/",
        publisher: "Vanderbilt University",
      },
      {
        title: "Pomodoro Technique",
        url: "https://arc.duke.edu/pomodoro-technique/",
        publisher: "Duke University Academic Resource Center",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 0,
        section: {
          type: "paragraph",
          content:
            'Study-skills guidance from <cite href="https://tutor.umn.edu/active-recall-test-yourself-better-retention">the University of Minnesota</cite> and <cite href="https://cft.vanderbilt.edu/guides-sub-pages/spacing-effect/">Vanderbilt University</cite> highlights active recall and spaced review as high-impact learning strategies, while <cite href="https://arc.duke.edu/pomodoro-technique/">Duke University\'s Academic Resource Center</cite> recommends Pomodoro-style work intervals to improve focus and reduce mental fatigue.',
        },
      },
    ],
  },
  "public-speaking-benefits": {
    authorProfile: founderAuthorProfile,
    citationSources: [
      {
        title: "Social Anxiety Disorder: More Than Just Shyness",
        url: "https://www.nimh.nih.gov/health/publications/social-anxiety-disorder-more-than-just-shyness",
        publisher: "National Institute of Mental Health",
      },
      {
        title: "Practicing speeches improves students' attitudes about public speaking",
        url: "https://www.cmu.edu/teaching/teaching-as-research/hyatt.html",
        publisher: "Carnegie Mellon University",
      },
      {
        title: "High school students develop communication skills through speech and debate",
        url: "https://news.asu.edu/20200129-high-school-students-develop-communication-skills-through-speech-and-debate-asu",
        publisher: "Arizona State University",
      },
    ],
    insertedSections: [
      {
        afterSectionIndex: 0,
        section: {
          type: "paragraph",
          content:
            'Public-speaking anxiety is common enough that <cite href="https://www.nimh.nih.gov/health/publications/social-anxiety-disorder-more-than-just-shyness">the National Institute of Mental Health</cite> lists speaking in public as a frequent trigger for social anxiety, while <cite href="https://www.cmu.edu/teaching/teaching-as-research/hyatt.html">Carnegie Mellon University</cite> and <cite href="https://news.asu.edu/20200129-high-school-students-develop-communication-skills-through-speech-and-debate-asu">Arizona State University</cite> highlight how practice, feedback, and debate training strengthen speaking confidence and communication skills.',
        },
      },
    ],
  },
};

export function enrichBlogPosts(posts: BlogPost[]) {
  return posts.map((post) => {
    const enhancement = articleEnhancements[post.slug];
    const authorProfile = enhancement?.authorProfile ?? founderAuthorProfile;
    const sections = post.sections.map((section) => ({
      ...section,
      ...(section.items ? { items: [...section.items] } : {}),
    }));

    if (enhancement?.insertedSections?.length) {
      for (const insertion of [...enhancement.insertedSections].sort(
        (a, b) => a.afterSectionIndex - b.afterSectionIndex,
      )) {
        sections.splice(insertion.afterSectionIndex + 1, 0, insertion.section);
      }
    }

    return {
      ...post,
      author: authorProfile.name,
      authorProfile,
      citationSources: enhancement?.citationSources ?? [],
      schemaType: enhancement?.schemaType ?? post.schemaType,
      sections,
    };
  });
}
