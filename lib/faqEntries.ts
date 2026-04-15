// Rich per-question FAQ entries. Each becomes its own /faq/[slug] page
// with unique meta tags, expanded body content, and a single-question
// FAQPage schema. The short `answer` field is the version shown in
// aggregated schema on the homepage and /faq index.

export type FaqBodySection =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "list"; items: string[] };

export type FaqEntry = {
  slug: string;
  question: string;
  answer: string; // short version (used in aggregated FAQPage schema)
  metaTitle: string;
  metaDescription: string;
  body: FaqBodySection[];
  relatedLinks: Array<{ href: string; label: string }>;
  relatedFaqSlugs: string[];
};

export const faqEntries: FaqEntry[] = [
  {
    slug: "what-ages-and-grades",
    question: "What ages and grades do you teach?",
    answer:
      "DSDC offers debate and public speaking classes for students in Grades 4 through 12. We split students into Novice (Grades 4-6), Junior (Grades 7-9), Senior (Grades 10-12), and Advanced Competitive (Grades 10-12) based on age, confidence, and experience.",
    metaTitle: "What Ages and Grades Do DSDC Debate Classes Teach?",
    metaDescription:
      "DSDC teaches debate and public speaking to students in Grades 4-12, split into Novice, Junior, Senior, and Advanced Competitive levels. Learn which class level fits your child.",
    body: [
      {
        type: "paragraph",
        content:
          "DSDC teaches students across the full Grade 4 to Grade 12 range. We also have a public speaking program for younger students who want to build confidence before moving into full debate. Rather than forcing every child into the same curriculum, we use four age-and-experience bands so students grow with peers who are at a similar stage.",
      },
      {
        type: "heading",
        content: "Novice (Grades 4-6)",
      },
      {
        type: "paragraph",
        content:
          "Novice is our on-ramp for younger students and complete beginners. Classes build the fundamentals - speaking clearly, making a structured argument, listening to the other side, and responding politely under pressure. Many Novice families choose this level for a child who needs more confidence in school presentations or who is ready to try something more intellectual than a typical enrichment class.",
      },
      {
        type: "heading",
        content: "Junior (Grades 7-9)",
      },
      {
        type: "paragraph",
        content:
          "Junior classes move into competitive debate formats and more challenging topics. Students learn to build cases, rebut opposing arguments, and take Points of Information in formats used at real tournaments. This is the level where many DSDC students first compete at provincial or national events.",
      },
      {
        type: "heading",
        content: "Senior (Grades 10-12)",
      },
      {
        type: "paragraph",
        content:
          "Senior classes cover the major tournament formats used at the Canadian National Debate Championships, BC Provincials, OSDU tournaments, and international events. Students train in CNDF, British Parliamentary, World Schools, and Cross-Examination formats, often while preparing for university applications.",
      },
      {
        type: "heading",
        content: "Advanced Competitive (Grades 10-12)",
      },
      {
        type: "paragraph",
        content:
          "Our most rigorous level, designed for students who are deeply committed to competitive debate. Classes run twice per week and focus on advanced argumentation, elite-level case construction, and high-stakes practice rounds. Many Advanced Competitive students are training for Canadian Nationals, World Schools Debating Championships, or the Tournament of Champions at Yale via the World Scholar's Cup.",
      },
      {
        type: "paragraph",
        content:
          "If you are not sure which level fits your child, the easiest way to find out is a free 15-minute consultation. We place each student based on their grade, confidence, and experience rather than assuming one-size-fits-all.",
      },
    ],
    relatedLinks: [
      { href: "/classes", label: "Compare all class levels" },
      { href: "/debate-classes-for-beginners", label: "Beginner classes" },
      { href: "/debate-classes-for-kids", label: "Debate classes for kids" },
      { href: "/book", label: "Book a free consultation" },
    ],
    relatedFaqSlugs: ["no-prior-experience-needed", "what-a-debate-class-looks-like", "free-trial-class"],
  },
  {
    slug: "how-classes-are-conducted",
    question: "How are classes conducted?",
    answer:
      "All DSDC classes are held live online via Zoom. Group classes are 2 hours per session with 8-12 students, so every child gets personalized attention and real speaking practice every week. Private coaching is also available with flexible scheduling.",
    metaTitle: "How Are DSDC Online Debate Classes Conducted?",
    metaDescription:
      "DSDC classes run live via Zoom with 8-12 students per group, 2 hours per session. Learn exactly how our online format works, what your child needs to join, and why live instruction beats recorded videos.",
    body: [
      {
        type: "paragraph",
        content:
          "All DSDC classes are delivered live online via Zoom. There are no recorded videos, no self-paced modules, and no asynchronous coursework. Every class is taught in real time by a human coach, with small groups of 8-12 students so every child participates instead of passively watching.",
      },
      {
        type: "heading",
        content: "Class Length and Schedule",
      },
      {
        type: "paragraph",
        content:
          "Group classes run for two hours per session, once or twice per week depending on the program. That length gives enough time for a short lesson or topic introduction, speaking drills, a full practice round, and personalized feedback at the end. Private coaching is scheduled flexibly to fit each student's goals.",
      },
      {
        type: "heading",
        content: "What Your Child Needs to Join",
      },
      {
        type: "list",
        items: [
          "A computer or laptop with a webcam and microphone",
          "A reliable internet connection",
          "A quiet place to speak and take notes",
          "Zoom installed (free download)",
        ],
      },
      {
        type: "paragraph",
        content:
          "We provide the curriculum, structure, feedback, and weekly assignments. Families do not need to buy textbooks or supplementary software - everything is included.",
      },
      {
        type: "heading",
        content: "Why Live Online Works Better Than In-Person for Many Families",
      },
      {
        type: "paragraph",
        content:
          "Live online debate classes give you the same coaching interaction as an in-person class while removing the commute, parking, and cross-city driving. For Canadian families who might otherwise spend an hour driving to and from a physical academy, that time savings often makes the difference between sticking with the program and dropping it. You can read more about how online classes compare to in-person programs in our [online vs in-person comparison](/blog/online-vs-in-person-debate-classes).",
      },
      {
        type: "heading",
        content: "Interactive Tools in Every Class",
      },
      {
        type: "paragraph",
        content:
          "Coaches use Zoom breakout rooms for small-group speaking practice, shared documents for case construction, live polling for topic selection, and built-in timers for structured rounds. The experience is genuinely interactive, not a lecture.",
      },
    ],
    relatedLinks: [
      { href: "/online-debate-classes", label: "Online debate classes" },
      { href: "/classes", label: "View class schedule" },
      { href: "/book", label: "Book a free consultation" },
    ],
    relatedFaqSlugs: ["what-a-debate-class-looks-like", "debate-classes-cost", "what-ages-and-grades"],
  },
  {
    slug: "debate-classes-cost",
    question: "How much do classes cost?",
    answer:
      "DSDC publishes pricing openly. Novice & Intermediate Debate and Public Speaking are $720 CAD per 12-week term plus applicable taxes. World Scholar's Cup is $960 CAD per term. Advanced Competitive is $1,200 CAD per term. Private coaching and sibling discounts are also available.",
    metaTitle: "How Much Do Online Debate Classes Cost at DSDC?",
    metaDescription:
      "DSDC publishes transparent group-class pricing: $720-$1,200 CAD per 12-week term depending on level. Compare novice, Junior, Senior, Advanced Competitive, and World Scholar's Cup pricing.",
    body: [
      {
        type: "paragraph",
        content:
          "DSDC publishes its rates openly so families can compare honestly before committing. Unlike some debate academies that require a call before revealing pricing, we list everything on our pricing page and let families make informed decisions.",
      },
      {
        type: "heading",
        content: "Current Group Class Pricing",
      },
      {
        type: "list",
        items: [
          "Novice & Intermediate Debate: $720 CAD per 12-week term (plus applicable taxes)",
          "Public Speaking: $720 CAD per 12-week term (plus applicable taxes)",
          "World Scholar's Cup: $960 CAD per 12-week term (plus applicable taxes)",
          "Advanced Competitive: $1,200 CAD per 12-week term (plus applicable taxes)",
        ],
      },
      {
        type: "paragraph",
        content:
          "That works out to roughly $30 to $50 CAD per hour for group classes, which is substantially more affordable than many in-person Vancouver debate academies that charge $60-$100 or more per hour.",
      },
      {
        type: "heading",
        content: "Private Coaching",
      },
      {
        type: "paragraph",
        content:
          "Private coaching is available for students who want one-on-one support - for example, students preparing for a major tournament, building a competition case, or catching up on a specific format. Private rates are higher than group rates but offer maximum flexibility.",
      },
      {
        type: "heading",
        content: "Sibling Discounts and Payment Options",
      },
      {
        type: "paragraph",
        content:
          "Families with multiple children enrolled receive sibling discounts. We also offer monthly payment plans and referral credits. Full details are on our [pricing page](/pricing).",
      },
      {
        type: "heading",
        content: "What the Price Includes",
      },
      {
        type: "paragraph",
        content:
          "Every class includes live instruction, structured weekly practice, personalized written feedback, semester report cards, access to our full curriculum materials, and preparation support for major tournaments. There are no surprise textbook fees or extra material costs.",
      },
      {
        type: "heading",
        content: "Is It Worth It?",
      },
      {
        type: "paragraph",
        content:
          "Parents often ask whether debate classes are a good investment compared to other enrichment options. Debate builds skills that compound over time - confidence, structured thinking, research habits, and public speaking ability - that transfer directly to school, university applications, and adult careers. For a deeper look at the value side of the question, see our article on [how much debate classes should cost](/blog/debate-classes-cost).",
      },
    ],
    relatedLinks: [
      { href: "/pricing", label: "View full pricing" },
      { href: "/classes", label: "Compare classes" },
      { href: "/book", label: "Book a free consultation" },
    ],
    relatedFaqSlugs: ["what-ages-and-grades", "how-classes-are-conducted", "free-trial-class"],
  },
  {
    slug: "no-prior-experience-needed",
    question: "Does my child need prior debate experience?",
    answer:
      "No. DSDC's Novice and Public Speaking classes are designed for complete beginners. Many of our most successful students started with zero experience. We place every new student into the right level based on grade, confidence, and goals.",
    metaTitle: "Do You Need Prior Experience to Join DSDC Debate Classes?",
    metaDescription:
      "No prior debate experience is needed to join DSDC. Our Novice and Public Speaking classes are designed for complete beginners, and many of our top students started with zero experience.",
    body: [
      {
        type: "paragraph",
        content:
          "No prior debate experience is required to join DSDC. Most new students start with no competitive background and build from the ground up. Our Novice and Public Speaking programs are designed exactly for that: structured, beginner-friendly, and confidence-focused.",
      },
      {
        type: "heading",
        content: "Where Beginners Usually Start",
      },
      {
        type: "paragraph",
        content:
          "Younger students (Grades 4-6) typically begin in our Novice Debate class or in Public Speaking. Both levels assume zero prior knowledge. Coaches teach the basics of structured speaking, arguing for and against an idea, listening to an opposing view, and responding under time pressure - all in a supportive small-group environment.",
      },
      {
        type: "paragraph",
        content:
          "Middle school students (Grades 7-9) starting with no experience usually begin in Junior classes, which introduce real tournament formats without assuming previous training. Students in these classes learn fundamentals at a slightly faster pace because they bring more maturity and background reading to the work.",
      },
      {
        type: "paragraph",
        content:
          "Older high school students (Grades 10-12) who are brand new can still join. We place them into Senior classes and help them catch up through extra practice rounds, written feedback, and targeted skill drills during the first few weeks.",
      },
      {
        type: "heading",
        content: "What Beginners Actually Learn in the First Month",
      },
      {
        type: "list",
        items: [
          "How to make a clear, structured argument in under 60 seconds",
          "How to listen to the opposing side and respond to the strongest point",
          "How to handle nerves before and during a speech",
          "The basic structure of a debate round and how speeches are organized",
          "How to take constructive feedback and apply it the following week",
        ],
      },
      {
        type: "heading",
        content: "Is Shy or Introverted Okay?",
      },
      {
        type: "paragraph",
        content:
          "Yes. Many of our most successful students started as shy, quiet kids who needed a low-pressure way to build confidence. The online format actually helps here - students are in a familiar home environment rather than a loud in-person classroom, which makes the first few weeks easier. You can read more in our post on [debate classes for shy kids](/blog/debate-classes-shy-kids) and our guide on [helping a shy child build confidence speaking](/blog/shy-child-public-speaking).",
      },
      {
        type: "heading",
        content: "How We Pick the Right Starting Level",
      },
      {
        type: "paragraph",
        content:
          "Every new student starts with a free 15-minute consultation. We talk through the child's grade, confidence level, interests, and goals, then recommend the class that fits. Placement is based on the student, not on a pre-set enrollment quota.",
      },
    ],
    relatedLinks: [
      { href: "/debate-classes-for-beginners", label: "Beginner debate classes" },
      { href: "/public-speaking-classes-for-kids", label: "Public speaking classes for kids" },
      { href: "/book", label: "Book a free consultation" },
    ],
    relatedFaqSlugs: ["what-ages-and-grades", "what-a-debate-class-looks-like", "free-trial-class"],
  },
  {
    slug: "what-a-debate-class-looks-like",
    question: "What does a typical class look like?",
    answer:
      "Classes begin with a short warm-up or lesson on a current topic, followed by structured speaking practice or full debate rounds, and end with personalized feedback from the coach. Students also receive homework and written feedback between sessions.",
    metaTitle: "What Does a DSDC Online Debate Class Actually Look Like?",
    metaDescription:
      "A breakdown of what happens in a typical DSDC online debate class - warm-ups, lessons, speaking practice, full rounds, and personalized feedback. Learn exactly what to expect week to week.",
    body: [
      {
        type: "paragraph",
        content:
          "Parents often want to know what actually happens during a DSDC class. Here is a realistic walkthrough of a typical two-hour group session, minute by minute, so you can picture what your child's week looks like.",
      },
      {
        type: "heading",
        content: "Minutes 0-10: Warm-up and Check-in",
      },
      {
        type: "paragraph",
        content:
          "The class opens with a quick warm-up: a one-minute impromptu speech on a light topic, a brainstorming exercise, or a discussion of a recent news story. The goal is to get every student speaking in the first ten minutes so nobody has time to feel nervous about it.",
      },
      {
        type: "heading",
        content: "Minutes 10-30: Lesson or Skill Focus",
      },
      {
        type: "paragraph",
        content:
          "Each class has a specific skill focus - for example, how to construct a case, how to take Points of Information, how to give a strong rebuttal, or how to structure a speech with a clear signpost. The coach introduces the concept, shows examples, and leads a short discussion before moving into practice.",
      },
      {
        type: "heading",
        content: "Minutes 30-75: Speaking Practice and Drills",
      },
      {
        type: "paragraph",
        content:
          "This is the biggest block of the class. Students split into pairs or small groups (using Zoom breakout rooms), work on the skill that was just introduced, and deliver speeches or run partial debates. The coach rotates between groups giving real-time feedback. Every student gets multiple speaking opportunities.",
      },
      {
        type: "heading",
        content: "Minutes 75-110: Full Practice Round",
      },
      {
        type: "paragraph",
        content:
          "Most classes include a full practice round - either a short formal debate or a speech competition, depending on the week. Students apply what they just learned under realistic conditions. Coaches take notes on each speaker to use during the feedback session.",
      },
      {
        type: "heading",
        content: "Minutes 110-120: Feedback and Homework",
      },
      {
        type: "paragraph",
        content:
          "The class closes with direct feedback to each student - what worked, what to improve, and what to focus on next week. Students also receive a short homework assignment: a research task, a speech outline, or a reflection on the day's round. Homework is designed to be manageable, usually 20-30 minutes of work between classes.",
      },
      {
        type: "heading",
        content: "What Makes This Structure Work",
      },
      {
        type: "paragraph",
        content:
          "Every class mixes instruction, practice, application, and feedback. Students do not sit through 30 minutes of lecture - they are speaking, listening, and responding constantly. That is how debate skill actually builds. For a deeper look, read our guide on [what a debate class actually looks like](/blog/what-debate-class-looks-like).",
      },
    ],
    relatedLinks: [
      { href: "/classes", label: "View class schedule" },
      { href: "/online-debate-classes", label: "Online debate classes" },
      { href: "/book", label: "Book a free consultation" },
    ],
    relatedFaqSlugs: ["how-classes-are-conducted", "what-ages-and-grades", "no-prior-experience-needed"],
  },
  {
    slug: "free-trial-class",
    question: "Can my child try a class before committing?",
    answer:
      "Yes. We encourage families to book a free 15-minute consultation first, and we can often arrange a trial session so your child can experience the class environment before enrolling. There is no commitment required.",
    metaTitle: "Can My Child Try a DSDC Debate Class Before Committing?",
    metaDescription:
      "Yes - DSDC offers a free 15-minute consultation and can often arrange a trial session so your child can experience an online debate class before enrolling. No commitment required.",
    body: [
      {
        type: "paragraph",
        content:
          "Yes. DSDC encourages every family to try a class or consultation before enrolling. We know that committing to a new extracurricular is a real decision, especially for kids who might be nervous about trying something new, so we make the first step low-risk.",
      },
      {
        type: "heading",
        content: "Step 1: The Free 15-Minute Consultation",
      },
      {
        type: "paragraph",
        content:
          "Every new family starts with a free 15-minute consultation. On the call, we talk through your child's grade, current confidence level, interests, and goals, and recommend the right DSDC class. It is a real conversation, not a sales pitch - if a DSDC class is not the right fit, we will tell you and often suggest alternatives.",
      },
      {
        type: "heading",
        content: "Step 2: Trial Session (When Available)",
      },
      {
        type: "paragraph",
        content:
          "For most levels, we can arrange a trial session so your child can sit in on a real class and experience the coaching style, group dynamics, and lesson flow before making a decision. This is the most accurate way to tell whether a particular class or coach is the right fit.",
      },
      {
        type: "heading",
        content: "What to Expect on the Consultation Call",
      },
      {
        type: "list",
        items: [
          "A short conversation with a DSDC team member, usually via video or phone",
          "Questions about your child's grade, school experience, and any previous enrichment",
          "An overview of which DSDC classes could fit, with honest trade-offs",
          "Clear next steps - either a trial class, an enrollment recommendation, or a suggestion to wait",
        ],
      },
      {
        type: "heading",
        content: "Why a Free Consultation First",
      },
      {
        type: "paragraph",
        content:
          "Placing a student into the wrong class is worse than placing them into no class at all. The consultation exists to prevent that. We would rather spend 15 minutes getting it right than have a student join a class that is too hard, too easy, or the wrong format for their goals.",
      },
      {
        type: "paragraph",
        content:
          "Ready to book? Head to our [booking page](/book) to pick a time that works for your family. Most consultations happen within a few days of booking.",
      },
    ],
    relatedLinks: [
      { href: "/book", label: "Book a free consultation" },
      { href: "/classes", label: "See all classes" },
      { href: "/pricing", label: "View pricing" },
    ],
    relatedFaqSlugs: ["what-ages-and-grades", "no-prior-experience-needed", "how-to-register"],
  },
  {
    slug: "what-is-world-scholars-cup",
    question: "What is the World Scholar's Cup?",
    answer:
      "The World Scholar's Cup (WSC) is a prestigious international academic competition combining team debate, collaborative writing, a multiple-choice exam, and a team quiz. DSDC has maintained a 100% qualification rate since 2020 - every team we've coached has advanced from regionals through globals and the Tournament of Champions at Yale.",
    metaTitle: "What Is the World Scholar's Cup? | DSDC Explained",
    metaDescription:
      "The World Scholar's Cup is an international academic competition with four events: Team Debate, Collaborative Writing, Scholar's Challenge, and Scholar's Bowl. DSDC has a 100% qualification rate since 2020.",
    body: [
      {
        type: "paragraph",
        content:
          "The World Scholar's Cup (WSC) is a global academic competition for students of all ages, founded in 2006. It combines four events: Team Debate, Collaborative Writing, Scholar's Challenge (a 120-question multiple-choice exam), and Scholar's Bowl (a team-based multimedia quiz). It is one of the most rewarding academic journeys available to students in Grades 4-12.",
      },
      {
        type: "heading",
        content: "The Competition Pathway",
      },
      {
        type: "paragraph",
        content:
          "Students compete in Regional Rounds held in cities worldwide, advance to Global Rounds (hosted in cities like Beijing, Amsterdam, Sydney, and Durban), and the top scholars qualify for the Tournament of Champions at Yale University. It is a three-stage progression from local participation to world-level competition.",
      },
      {
        type: "heading",
        content: "The Four WSC Events",
      },
      {
        type: "list",
        items: [
          "Team Debate - three-speaker team debates on curriculum-linked motions",
          "Collaborative Writing - teams write a single essay together under time pressure",
          "Scholar's Challenge - a 120-question individual multiple-choice exam across six subjects",
          "Scholar's Bowl - a team-based multimedia quiz with images, audio, and video",
        ],
      },
      {
        type: "paragraph",
        content:
          "Every event draws from the same six subject areas that rotate each year: Science, History, Art & Music, Literature, Social Studies, and a Special Area. Because every event overlaps, good preparation has to be interdisciplinary - it is not enough to be good at just one piece.",
      },
      {
        type: "heading",
        content: "DSDC's 100% Qualification Rate",
      },
      {
        type: "paragraph",
        content:
          "Every DSDC student who has entered a WSC Regional Round since 2020 has qualified to advance through the next level. That 100% qualification rate - from regionals through Global Rounds and all the way to the Tournament of Champions at Yale - is unusual in the WSC coaching space, and it is what we train every cohort toward.",
      },
      {
        type: "heading",
        content: "Who WSC Is For",
      },
      {
        type: "paragraph",
        content:
          "WSC is ideal for curious, academically motivated students who love learning across subjects. You do not need debate experience to join, because WSC includes debate as just one of four events. Students who love reading, trivia, writing, or intellectual discussion often thrive here.",
      },
      {
        type: "paragraph",
        content:
          "For a much deeper look at the format, events, preparation timeline, and how DSDC coaches for WSC, visit our dedicated [World Scholar's Cup coaching page](/world-scholars-cup-coaching).",
      },
    ],
    relatedLinks: [
      { href: "/world-scholars-cup-coaching", label: "WSC coaching program" },
      { href: "/classes", label: "View all classes" },
      { href: "/book", label: "Book a free consultation" },
    ],
    relatedFaqSlugs: ["what-ages-and-grades", "debate-classes-cost", "how-to-register"],
  },
  {
    slug: "how-to-register",
    question: "How do I register or get started?",
    answer:
      "The easiest way to start is to book a free 15-minute consultation. We'll discuss your child's interests, recommend the right class, and walk you through enrollment - no commitment required.",
    metaTitle: "How to Register for DSDC Debate Classes",
    metaDescription:
      "Ready to join DSDC? Book a free 15-minute consultation, get a class recommendation, and complete enrollment. Here's a step-by-step guide to registering for DSDC online debate classes.",
    body: [
      {
        type: "paragraph",
        content:
          "Getting started at DSDC takes about two steps: a free consultation and a quick enrollment confirmation. Here is exactly how it works so you know what to expect.",
      },
      {
        type: "heading",
        content: "Step 1: Book a Free Consultation",
      },
      {
        type: "paragraph",
        content:
          "Visit our [booking page](/book) and pick a 15-minute time slot that works for your family. Consultations are free, held on Zoom or by phone, and there is no commitment at the end.",
      },
      {
        type: "heading",
        content: "Step 2: Talk About Your Child",
      },
      {
        type: "paragraph",
        content:
          "On the consultation call, we ask about your child's grade, personality, confidence level, school experience, and any goals you have for them. We also answer any questions you have about our format, pricing, or scheduling. Think of it as a conversation about fit, not a sales pitch.",
      },
      {
        type: "heading",
        content: "Step 3: Get a Class Recommendation",
      },
      {
        type: "paragraph",
        content:
          "Based on the consultation, we recommend a specific DSDC class - for example, Novice Debate for Grade 5, Junior for Grade 8, or Senior Public Speaking for Grade 10. If more than one option could work, we explain the trade-offs so you can decide.",
      },
      {
        type: "heading",
        content: "Step 4: Enroll and Pick a Cohort",
      },
      {
        type: "paragraph",
        content:
          "Enrollment is handled through our [registration page](/register) or directly after the consultation. You pick the cohort and start date that fits your family. Payment plans and sibling discounts are available.",
      },
      {
        type: "heading",
        content: "Step 5: First Class",
      },
      {
        type: "paragraph",
        content:
          "You receive Zoom details, a welcome email with what to expect, and a short prep note for your child. On the day of the first class, students simply log in and the coach takes it from there. Families often tell us the first class went much more smoothly than they expected.",
      },
      {
        type: "heading",
        content: "Still Comparing Programs?",
      },
      {
        type: "paragraph",
        content:
          "If you want to compare DSDC with other options before booking, start with our [pricing page](/pricing), our [class lineup](/classes), and our [coaching team](/team). Parents in BC can also read our guide to the [best debate programs in Vancouver](/blog/best-debate-programs-vancouver) for a broader comparison.",
      },
    ],
    relatedLinks: [
      { href: "/book", label: "Book a free consultation" },
      { href: "/register", label: "Go to registration" },
      { href: "/classes", label: "View all classes" },
      { href: "/pricing", label: "View pricing" },
    ],
    relatedFaqSlugs: ["free-trial-class", "debate-classes-cost", "what-ages-and-grades"],
  },
];

export function getFaqEntry(slug: string): FaqEntry | undefined {
  return faqEntries.find((entry) => entry.slug === slug);
}

export function getAllFaqSlugs(): string[] {
  return faqEntries.map((entry) => entry.slug);
}
