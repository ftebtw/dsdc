export type RegionalLandingPageSlug = "calgary" | "ottawa" | "ontario" | "alberta";

export type RegionalLandingPageData = {
  slug: RegionalLandingPageSlug;
  path: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumbName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  keyFacts: Array<{ label: string; value: string }>;
  whyTitle: string;
  whyParagraphs: string[];
  offeringsTitle: string;
  offerings: Array<{ title: string; text: string; href: string; linkLabel: string }>;
  expectationsTitle: string;
  expectations: Array<{ title: string; text: string }>;
  areasTitle: string;
  areas: string[];
  areasParagraph: string;
  faqItems: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaText: string;
  relatedLinks: Array<{ href: string; label: string }>;
};

export const regionalLandingPages: Record<RegionalLandingPageSlug, RegionalLandingPageData> = {
  calgary: {
    slug: "calgary",
    path: "/debate-classes-calgary",
    metaTitle: "Debate Classes Calgary | Online Debate Coaching for Kids | DSDC",
    metaDescription:
      "DSDC offers online debate classes Calgary families can join from home, with public speaking, competitive debate training, and expert coaching for Grades 4-12.",
    breadcrumbName: "Debate Classes Calgary",
    heroTitle: "Debate Classes Calgary Families Can Join Online",
    heroSubtitle:
      "Live online debate coaching for students in Calgary who want stronger public speaking, sharper thinking, and a structured path into competitive debate.",
    heroDescription:
      "DSDC helps Calgary families access serious debate and public speaking training without being limited by commute time, neighborhood boundaries, or a small local club schedule.",
    keyFacts: [
      { label: "Format", value: "Live online via Zoom" },
      { label: "Students served", value: "Grades 4-12 and beyond" },
      { label: "Class size", value: "Usually 8-12 students" },
      { label: "Service area", value: "Calgary, Airdrie, Chestermere, Cochrane, Okotoks, and nearby communities" },
      { label: "Focus", value: "Debate, public speaking, tournament prep, and confidence building" },
      { label: "Pricing", value: "Transparent group pricing published online" },
    ],
    whyTitle: "Why Calgary Families Choose Online Debate Coaching",
    whyParagraphs: [
      "Parents looking for debate classes in Calgary often want a program that is rigorous enough to produce real growth but flexible enough to fit around school, sports, music, and family life. That is exactly where a live online format helps. Students still get structured speaking practice and direct feedback, but the weekly routine is easier to maintain over a full semester.",
      "Calgary families also benefit from broader coaching access. Rather than being limited to whichever program happens to be nearby, students can train with coaches from strong national and international debate backgrounds while staying in their own home environment. For many students, that combination of convenience and coaching quality leads to faster progress than a less consistent in-person option.",
      "Another advantage is fit. Some students need beginner-friendly public speaking support before moving into more formal debate, while others are ready for CNDF, British Parliamentary, World Schools, or Cross-Examination right away. DSDC helps families choose the right entry point rather than assuming every child should start in the same place.",
    ],
    offeringsTitle: "What Calgary Students Can Study at DSDC",
    offerings: [
      {
        title: "Beginner debate and confidence building",
        text: "Students who are new to debate start with structured speaking, rebuttal basics, and argument organization. This is a strong fit for children who need confidence, clearer classroom participation, and better communication habits before they think about competition.",
        href: "/debate-classes-for-beginners",
        linkLabel: "See beginner-friendly classes",
      },
      {
        title: "Full online debate classes for kids",
        text: "Our core class lineup gives Calgary families a clear progression from novice to advanced competitive levels. That makes it easier to stay with one program as your child grows instead of restarting every time they outgrow a local club.",
        href: "/classes",
        linkLabel: "Compare all class levels",
      },
      {
        title: "Public speaking and speech training",
        text: "Some children are better served by a public speaking class first. These programs build poise, delivery, and structure in a lower-pressure environment before students move into formal debate rounds.",
        href: "/public-speaking-classes-for-kids",
        linkLabel: "Explore public speaking classes",
      },
      {
        title: "Competitive and tournament-focused pathways",
        text: "For students who want a more ambitious path, DSDC also supports major Canadian formats, advanced competitive training, and specialized enrichment like World Scholar's Cup preparation.",
        href: "/online-debate-classes",
        linkLabel: "Learn how online debate works",
      },
    ],
    expectationsTitle: "What Parents Should Expect Week to Week",
    expectations: [
      {
        title: "A repeatable weekly structure",
        text: "Students join a live class, work through a lesson or format focus, participate in speaking drills or practice rounds, and receive feedback they can apply the following week.",
      },
      {
        title: "Manageable homework",
        text: "Most assignments are practical rather than heavy: a short case outline, a research task, or a speaking exercise that connects directly to the next session.",
      },
      {
        title: "Visible improvement over time",
        text: "Parents usually notice progress first in school presentations, confidence, and clarity. Over time, students also become stronger listeners, refuters, and researchers.",
      },
    ],
    areasTitle: "Where Students Join From Around Calgary",
    areas: [
      "Central Calgary and the inner city",
      "Northwest and Northeast Calgary",
      "Southwest and Southeast Calgary",
      "Airdrie, Chestermere, and Cochrane",
      "Okotoks and surrounding communities",
    ],
    areasParagraph:
      "Because DSDC is online, families do not need to choose between strong coaching and a workable schedule. Students from across Calgary and the surrounding area can join the same live classes, receive the same written feedback, and stay consistent even during busy school terms or winter travel conditions.",
    faqItems: [
      {
        question: "Do Calgary students really get enough speaking time in an online class?",
        answer:
          "Yes. Classes are intentionally kept small so every student participates actively rather than sitting through a lecture.",
      },
      {
        question: "Is this a good fit if my child has never debated before?",
        answer:
          "Absolutely. Many students begin with no prior experience, and we place them into a class that matches their grade level and confidence.",
      },
      {
        question: "What formats can Calgary students learn?",
        answer:
          "Students can train in CNDF, British Parliamentary, World Schools, Cross-Examination, and public speaking formats depending on the class.",
      },
      {
        question: "How do we choose the right class?",
        answer:
          "The easiest next step is to book a free consultation so we can recommend the best fit based on age, experience, and goals.",
      },
    ],
    ctaTitle: "Ready to find the right debate class for your child in Calgary?",
    ctaText:
      "Start with our class lineup, review pricing, and then book a free consultation so we can recommend the best fit for your family.",
    relatedLinks: [
      { href: "/classes", label: "Compare classes" },
      { href: "/pricing", label: "View pricing" },
      { href: "/team", label: "Meet the coaching team" },
      { href: "/debate-classes-alberta", label: "See our Alberta page" },
      { href: "/book", label: "Book a free consultation" },
    ],
  },
  ottawa: {
    slug: "ottawa",
    path: "/debate-classes-ottawa",
    metaTitle: "Debate Classes Ottawa | Online Speech and Debate for Kids | DSDC",
    metaDescription:
      "DSDC offers online debate classes Ottawa families can join for public speaking, debate coaching, and academic communication training for students in Grades 4-12.",
    breadcrumbName: "Debate Classes Ottawa",
    heroTitle: "Debate Classes Ottawa Families Can Access from Home",
    heroSubtitle:
      "Online speech and debate training for students in Ottawa who want better public speaking, clearer reasoning, and a stronger academic edge.",
    heroDescription:
      "DSDC gives Ottawa families a practical way to access high-level coaching without adding more commuting pressure to an already full school week.",
    keyFacts: [
      { label: "Format", value: "Live online via Zoom" },
      { label: "Best for", value: "Students who want confidence, structure, and academic communication growth" },
      { label: "Class size", value: "Usually 8-12 students" },
      { label: "Service area", value: "Ottawa, Kanata, Nepean, Orleans, Barrhaven, and nearby communities" },
      { label: "Programs", value: "Debate, public speaking, competitive training, and enrichment pathways" },
      { label: "Enrollment", value: "Placement support through a free consultation" },
    ],
    whyTitle: "Why Ottawa Parents Look Beyond a Local Club",
    whyParagraphs: [
      "Families searching for debate classes in Ottawa are usually trying to solve two problems at once. They want a child to become more confident and articulate, but they also want a program that fits into a realistic family schedule. A strong online class can do both well.",
      "Ottawa students often benefit from the academic side of debate just as much as the competitive side. Debate teaches students how to organize evidence, compare ideas, respond under pressure, and speak more clearly in class discussions, interviews, and presentations. Those habits carry well beyond tournaments.",
      "DSDC also gives Ottawa families more continuity. Instead of finding a small local option that may not have the right level every year, families can move through a clearer long-term pathway with beginner, intermediate, and advanced options all under one program.",
    ],
    offeringsTitle: "Programs Ottawa Students Commonly Choose",
    offerings: [
      {
        title: "Public speaking for confidence and presentation skill",
        text: "For younger or more hesitant students, public speaking is often the best starting point. It builds clarity and comfort before students move into full speech-and-debate rounds.",
        href: "/public-speaking-classes-for-kids",
        linkLabel: "Explore public speaking classes",
      },
      {
        title: "Core debate classes for kids",
        text: "Students learn how to make arguments, refute opposing claims, and respond more quickly in live discussion. Parents often choose this path when they want both confidence growth and stronger academic thinking.",
        href: "/classes",
        linkLabel: "Compare debate class levels",
      },
      {
        title: "Competitive debate and advanced formats",
        text: "Older students who want more challenge can work toward tournament formats used in Canada and beyond, including CNDF, British Parliamentary, World Schools, and Cross-Examination.",
        href: "/online-debate-classes",
        linkLabel: "See the online debate pathway",
      },
      {
        title: "National-context learning and enrichment",
        text: "Families who want to understand how school debate works across Canada often use DSDC both as a class provider and as a guide to the broader debate landscape.",
        href: "/guide-to-debate-in-canada",
        linkLabel: "Read the debate-in-Canada guide",
      },
    ],
    expectationsTitle: "What Ottawa Families Usually Want to Know",
    expectations: [
      {
        title: "How classes fit into the week",
        text: "Students join from home, which makes it easier to stay consistent across weather, traffic, and school demands.",
      },
      {
        title: "How students keep improving",
        text: "Coaches provide written feedback and targeted next steps, so progress continues between sessions instead of resetting every week.",
      },
      {
        title: "How parents can track growth",
        text: "The most visible changes are usually confidence, clearer speaking, stronger structure, and more thoughtful responses in school settings.",
      },
    ],
    areasTitle: "Where Ottawa Students Join From",
    areas: [
      "Downtown Ottawa and Centretown",
      "Kanata and Stittsville",
      "Nepean and Barrhaven",
      "Orleans and the east end",
      "Gatineau-area families seeking English-language debate coaching",
    ],
    areasParagraph:
      "Families across Ottawa can access the same live classes without being restricted by neighborhood or school catchment. That helps students keep a consistent debate routine while still training with peers from across Canada.",
    faqItems: [
      {
        question: "Can Ottawa students join even if their school has no debate club?",
        answer:
          "Yes. Many students use DSDC because their school does not offer a debate club or does not offer enough training depth.",
      },
      {
        question: "Is online debate effective for shy students?",
        answer:
          "It can be especially effective because students are in a familiar home environment while still receiving live coaching and regular speaking practice.",
      },
      {
        question: "Do you serve students across Ottawa, not just downtown?",
        answer:
          "Yes. Students join from across Ottawa and nearby communities as long as they have a reliable internet connection and Zoom.",
      },
      {
        question: "What is the best next step for our family?",
        answer:
          "Compare the class options and then book a free consultation so we can recommend the best match for your child.",
      },
    ],
    ctaTitle: "Want a clearer path into debate and public speaking in Ottawa?",
    ctaText:
      "Review the class options, pricing, and coaching team, then book a free consultation so we can recommend the right level.",
    relatedLinks: [
      { href: "/classes", label: "Compare classes" },
      { href: "/pricing", label: "Review pricing" },
      { href: "/debate-classes-ontario", label: "See our Ontario page" },
      { href: "/debate-classes-toronto", label: "See our Toronto page" },
      { href: "/book", label: "Book a free consultation" },
    ],
  },
  ontario: {
    slug: "ontario",
    path: "/debate-classes-ontario",
    metaTitle: "Debate Classes Ontario | Online Debate and Public Speaking | DSDC",
    metaDescription:
      "DSDC offers online debate classes for Ontario students in Toronto, Ottawa, Mississauga, Brampton, Markham, and beyond, with live coaching for Grades 4-12.",
    breadcrumbName: "Debate Classes Ontario",
    heroTitle: "Online Debate Classes for Ontario Students",
    heroSubtitle:
      "Live online debate and public speaking coaching for families across Ontario, with clear pathways from beginner confidence building to advanced competitive debate.",
    heroDescription:
      "DSDC helps Ontario families access a strong speech-and-debate program whether they are in the GTA, Ottawa, or communities where specialized debate coaching is harder to find locally.",
    keyFacts: [
      { label: "Format", value: "Live online via Zoom" },
      { label: "Coverage", value: "Toronto, Ottawa, Mississauga, Brampton, Markham, Vaughan, Oakville, Milton, and more" },
      { label: "Age range", value: "Grades 4-12 and beyond" },
      { label: "Typical class size", value: "Usually 8-12 students" },
      { label: "Key outcome", value: "Confidence, structure, and competitive debate growth" },
      { label: "Support", value: "Placement guidance through a free consultation" },
    ],
    whyTitle: "Why Ontario Families Choose a Province-Wide Online Option",
    whyParagraphs: [
      "Ontario has many talented students interested in debate, but access to the right program is uneven. Some families are in the GTA and comparing multiple options, while others are in cities or suburbs where specialized coaching is much harder to access. A strong online model helps close that gap.",
      "DSDC works well for Ontario families because it combines real structure with flexibility. Students join live classes, receive written feedback, and follow a clear curriculum, but they avoid the time cost of cross-city commuting or relying on whatever school club happens to be available nearby.",
      "For parents, the biggest advantage is usually long-term fit. A child who begins with public speaking can move into debate later. A student who starts in a novice class can progress into more competitive formats over time. That continuity is much harder to find when families piece together different short-term programs year by year.",
    ],
    offeringsTitle: "What Ontario Students Usually Need From a Debate Program",
    offerings: [
      {
        title: "A strong beginner on-ramp",
        text: "Many students need a program that teaches structure, confidence, and speaking habits from scratch rather than assuming prior school-club experience.",
        href: "/debate-classes-for-beginners",
        linkLabel: "See beginner options",
      },
      {
        title: "A clear progression across levels",
        text: "Families want to know that if a child grows quickly, the next class already exists. DSDC's level structure makes that progression easier to plan for.",
        href: "/classes",
        linkLabel: "View the class pathway",
      },
      {
        title: "Local relevance with national perspective",
        text: "Ontario students need coaching that helps with school success now and competitive opportunities later. That means learning the broader Canadian debate ecosystem, not just one isolated style.",
        href: "/guide-to-debate-in-canada",
        linkLabel: "Read the national guide",
      },
      {
        title: "Regional landing pages for easier comparison",
        text: "Families in Toronto and Ottawa often want more local context before booking a consultation, so we also maintain dedicated regional pages for those markets.",
        href: "/debate-classes-toronto",
        linkLabel: "See our Toronto page",
      },
    ],
    expectationsTitle: "What Makes an Ontario-Wide Program Work",
    expectations: [
      {
        title: "Consistency across long distances",
        text: "Students can stay with the same strong coaching model whether they live in downtown Toronto, Ottawa, or a community without a local debate academy.",
      },
      {
        title: "More useful feedback than a drop-in club",
        text: "Students improve faster when feedback is written down, repeated, and connected to the next session rather than delivered casually once and forgotten.",
      },
      {
        title: "A path that grows with the student",
        text: "Ontario families often stay with a program longer when it can serve both beginners and more competitive students under one roof.",
      },
    ],
    areasTitle: "Where Ontario Families Join DSDC From",
    areas: [
      "Toronto and the GTA",
      "Ottawa and surrounding communities",
      "Mississauga, Brampton, and Oakville",
      "Markham, Vaughan, Richmond Hill, and North York",
      "Other Ontario communities seeking stronger debate coaching online",
    ],
    areasParagraph:
      "Because the program is online, DSDC is not limited to one Ontario city. That makes it a practical option both for GTA families comparing quality and for families outside major debate hubs who still want serious coaching.",
    faqItems: [
      {
        question: "Do Ontario students have to be in Toronto to join?",
        answer:
          "No. Students join from across Ontario, including Ottawa, the GTA, and communities beyond the largest city centers.",
      },
      {
        question: "Is this more like a class or a club?",
        answer:
          "It is much closer to a structured class. Students follow a progression, complete meaningful practice, and receive direct feedback from coaches.",
      },
      {
        question: "Can public speaking and debate both be part of the same path?",
        answer:
          "Yes. Many families begin with public speaking and then move into more formal debate once a student is ready.",
      },
      {
        question: "Where should we start if we are still comparing options?",
        answer:
          "Start with the class page and pricing page, then book a free consultation if you want help choosing the right fit.",
      },
    ],
    ctaTitle: "Looking for a stronger debate program anywhere in Ontario?",
    ctaText:
      "Use the class and pricing pages to compare options, then book a free consultation so we can recommend the right path for your child.",
    relatedLinks: [
      { href: "/debate-classes-toronto", label: "See our Toronto page" },
      { href: "/debate-classes-ottawa", label: "See our Ottawa page" },
      { href: "/classes", label: "Compare classes" },
      { href: "/pricing", label: "Review pricing" },
      { href: "/book", label: "Book a free consultation" },
    ],
  },
  alberta: {
    slug: "alberta",
    path: "/debate-classes-alberta",
    metaTitle: "Debate Classes Alberta | Online Debate Coaching for Kids | DSDC",
    metaDescription:
      "DSDC offers online debate classes for Alberta students in Calgary, Edmonton, and beyond, with live public speaking and debate coaching for Grades 4-12.",
    breadcrumbName: "Debate Classes Alberta",
    heroTitle: "Online Debate Classes for Alberta Students",
    heroSubtitle:
      "Live online debate and public speaking classes for Alberta families who want expert coaching, stronger communication skills, and a more consistent weekly learning experience.",
    heroDescription:
      "DSDC helps Alberta students build confidence and competitive skill through structured online training that works for families in Calgary, Edmonton, and communities beyond the largest debate hubs.",
    keyFacts: [
      { label: "Format", value: "Live online via Zoom" },
      { label: "Service area", value: "Calgary, Edmonton, Airdrie, Sherwood Park, St. Albert, Red Deer, and more" },
      { label: "Programs", value: "Debate, public speaking, advanced competitive training, and enrichment" },
      { label: "Class size", value: "Usually 8-12 students" },
      { label: "Age range", value: "Grades 4-12 and beyond" },
      { label: "Goal", value: "Confidence, communication, and deeper academic reasoning" },
    ],
    whyTitle: "Why Alberta Families Use DSDC",
    whyParagraphs: [
      "For Alberta families, online debate can solve a practical access problem. Some students are in Calgary or Edmonton and have local options, but still want a program with clearer progression and more individualized feedback. Others are outside the biggest city centers and need a strong debate option that does not depend on geography.",
      "DSDC works especially well when families want a program that is easy to sustain. Weekly online classes reduce travel time while still preserving live interaction, practice rounds, and direct teacher guidance. That combination is often more effective than a harder-to-maintain in-person routine.",
      "Alberta parents also tend to care about broader academic benefits. Debate builds research habits, logical organization, and more confident speaking in school. Those outcomes matter whether a child wants to compete seriously or simply become more articulate and self-assured.",
    ],
    offeringsTitle: "How Alberta Students Commonly Use the Program",
    offerings: [
      {
        title: "Speech and debate for foundational confidence",
        text: "Students who are just starting often need structured speaking opportunities that build calm, clear expression before they worry about competitive ranking.",
        href: "/public-speaking-classes-for-kids",
        linkLabel: "Explore public speaking options",
      },
      {
        title: "Core debate classes for kids and teens",
        text: "Our main debate classes help Alberta students learn argumentation, rebuttal, structure, and faster thinking in a repeatable weekly format.",
        href: "/classes",
        linkLabel: "Compare class levels",
      },
      {
        title: "Competitive pathways for ambitious students",
        text: "Students who are ready for more challenge can move into advanced formats and more serious tournament-style preparation.",
        href: "/online-debate-classes",
        linkLabel: "See the online competitive pathway",
      },
      {
        title: "Regional support for Alberta families",
        text: "Families in Calgary often want city-specific context, while province-wide families want a broader overview. DSDC supports both through targeted landing pages and consultation guidance.",
        href: "/debate-classes-calgary",
        linkLabel: "Visit our Calgary page",
      },
    ],
    expectationsTitle: "What Alberta Parents Should Know Before Enrolling",
    expectations: [
      {
        title: "Classes are interactive, not passive",
        text: "Students are expected to speak, respond, and practice regularly. The online format does not reduce participation expectations.",
      },
      {
        title: "Feedback drives improvement",
        text: "Students receive direct written feedback, which helps them connect week-to-week lessons into real long-term growth.",
      },
      {
        title: "The best fit depends on the child",
        text: "Some students need public speaking first, while others are ready for full debate training right away. Consultation helps us place students more accurately.",
      },
    ],
    areasTitle: "Where Alberta Students Join From",
    areas: [
      "Calgary and nearby communities",
      "Edmonton, Sherwood Park, and St. Albert",
      "Red Deer and central Alberta",
      "Families outside major urban centers seeking stronger coaching online",
    ],
    areasParagraph:
      "A province-wide online option is especially useful in Alberta because it gives students more continuity across distance. Families can focus on coaching quality and long-term development rather than whether a program is physically nearby.",
    faqItems: [
      {
        question: "Do Alberta students need debate experience to join?",
        answer:
          "No. Many students start with no formal debate background, and we place them into the right level for their age and confidence.",
      },
      {
        question: "Do you only serve Calgary?",
        answer:
          "No. We work with students across Alberta, including Edmonton-area families and communities beyond the biggest city centers.",
      },
      {
        question: "Can students focus on public speaking before full debate?",
        answer:
          "Yes. That is a common and very effective path for students who need confidence and presentation skill first.",
      },
      {
        question: "How do we start?",
        answer:
          "Review the classes and pricing, then book a free consultation so we can recommend the most suitable program.",
      },
    ],
    ctaTitle: "Want a stronger online debate option anywhere in Alberta?",
    ctaText:
      "See the class pathway, review pricing, and then book a free consultation so we can recommend the right next step for your child.",
    relatedLinks: [
      { href: "/debate-classes-calgary", label: "See our Calgary page" },
      { href: "/classes", label: "Compare classes" },
      { href: "/pricing", label: "Review pricing" },
      { href: "/guide-to-debate-in-canada", label: "Read the debate-in-Canada guide" },
      { href: "/book", label: "Book a free consultation" },
    ],
  },
};

export function getRegionalLandingPageData(slug: RegionalLandingPageSlug) {
  return regionalLandingPages[slug];
}
