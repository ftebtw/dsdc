export interface BlogSection {
  type: "heading" | "subheading" | "paragraph" | "list";
  content: string;
  items?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  sections: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "debate-classes-cost",
    title: "How Much Should Debate Classes Cost? Unveiling Transparency in Debate Coaching",
    excerpt:
      "At most academies, debate coaching tuition is shrouded in secrecy. We believe transparency is key — here's what fair pricing looks like and how to avoid predatory price gouging.",
    date: "2025-01-25",
    author: "DSDC Team",
    category: "Parents & Pricing",
    readTime: "4 min read",
    sections: [
      {
        type: "paragraph",
        content:
          "Have you ever tried to figure out how much debate classes would cost for your child ahead of registration? At most academies, this isn't an easy task. Unlike many other educational services, debate coaching tuition is often shrouded in secrecy. Prices aren't openly listed, and families are left to guess or inquire individually — only to find that the cost varies wildly depending on the income level or perceived capability of the student. This practice, known as price gouging, can leave parents unknowingly being taken advantage of when they are simply trying to seek a high quality education for their child.",
      },
      {
        type: "subheading",
        content: "Our Commitment to Fee Transparency",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, we believe that transparency is key to building trust and rapport with our community. We always have our up-to-date group class fees clearly listed on our website: our regular group debate classes are charged at $30 CAD per hour (plus GST), our World Scholars Cup group classes are priced at $40 CAD per hour (plus GST), and our accelerated BP competitive debate class is priced at $50 CAD per hour (plus GST), all for two-hour sessions. These fees reflect our commitment to providing accessible, fair, and equal pricing for all students, while balancing management and operational costs, coach hiring and contracting fees, reinvesting into curriculum development, marketing fees, and taxes.",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, we hope to set a new standard by practicing fee transparency — one where other academies will follow suit and adopt standardized pricing and pricing transparency. We aim to shine a light on the unfair and predatory pricing that is far too common in the education sector.",
      },
      {
        type: "subheading",
        content: "What Fair Pricing Looks Like",
      },
      {
        type: "paragraph",
        content:
          "Many debate academies charge exorbitant tuition fees, ranging into the tens of thousands of dollars in annual tuition for similar services. While some of these institutions attempt to justify these steep costs with shiny labels and unrealistic guarantees, it's important to remember that outstanding debate instruction doesn't have to come at such a steep price. Fair group class pricing typically ranges from $30 to $60 per hour per student, with the higher end reflecting coaches with extensive experience and a proven track record. One-on-one sessions, on the other hand, vary widely between academies and are influenced by factors such as coach availability, student demand, their competitive records, and the prestige of awards earned.",
      },
      {
        type: "subheading",
        content: "Making an Informed Decision",
      },
      {
        type: "paragraph",
        content:
          "Before enrolling in any debate coaching program, it's crucial to ask: What exactly are the fees, and how are they determined? By seeking out programs that clearly outline their costs, you can make an informed decision, ensuring your investment in your child's education is both valuable and fair. At DSDC, we believe that every student deserves access to quality debate coaching without hidden fees, price discrepancies, and unfair price hikes.",
      },
    ],
  },
  {
    slug: "qualify-canadian-nationals",
    title: "How to Qualify for the Canadian Nationals Debate Tournament",
    excerpt:
      "A step-by-step guide for junior and senior students to qualify for Canada's most prestigious high school debate competition — from regional tournaments to the national stage.",
    date: "2025-01-23",
    author: "DSDC Team",
    category: "Competitive Debate",
    readTime: "5 min read",
    sections: [
      {
        type: "paragraph",
        content:
          "Every year, the Canadian Nationals Debate Tournament brings together the best high school debaters from across the country to determine the rankings of the best debaters in the country. Qualifying for this prestigious event is a significant achievement in and of itself and requires dedication, skill, and strategic preparation. Here's a breakdown of how junior and senior students can start their journey to reach Nationals.",
      },
      {
        type: "subheading",
        content: "1. Meet Eligibility Requirements",
      },
      {
        type: "paragraph",
        content:
          "Each team must have two members that go to the same school and register through their school. Teams cannot register through institutions or as independents.",
      },
      {
        type: "list",
        content: "",
        items: [
          "Junior Division: Typically for students in grades 7–9, juniors compete against peers of similar age and experience. Some regions may have separate junior tournaments, while others allow juniors to compete in open divisions.",
          "Senior Division: For grades 10–12, seniors face tougher competition and often participate in open formats that include a wider range of experience levels.",
        ],
      },
      {
        type: "paragraph",
        content:
          "Both divisions require adherence to specific rules and standards set by their schools and provincial debating organizations, such as minimum participation in the season's tournaments and meeting age or grade-level criteria.",
      },
      {
        type: "subheading",
        content: "2. Participate in Regional Debate Tournaments",
      },
      {
        type: "paragraph",
        content:
          "Each province has slightly different rules to qualifying for Nationals, which can be verified through your province's debate association. To qualify for Nationals in BC, the first step is to register and compete in the regional debate tournament for your region. These competitions serve as the 'preliminary round', where the top debaters of regionals will advance to the provincial tournament. The exact process varies by province, but strong performance at this level is crucial.",
      },
      {
        type: "subheading",
        content: "3. Enter the Provincials Debate Tournament",
      },
      {
        type: "paragraph",
        content:
          "For instance, in British Columbia, after placing well in the regionals tournament, students that qualify will participate and compete in the BC Provincials Debate Tournament, where they will face off against the best teams in the province. Top-performing students from provincial tournaments are then selected to represent their province at Nationals.",
      },
      {
        type: "subheading",
        content: "4. Prepare for Nationals",
      },
      {
        type: "paragraph",
        content:
          "Once qualified, students need to prepare extensively for the challenges ahead. This includes:",
      },
      {
        type: "list",
        content: "",
        items: [
          "Prepare cases for the prepared motion",
          "Practicing impromptu and prepared debates",
          "Analyzing potential motions",
          "Refining teamwork and collaboration skills",
        ],
      },
      {
        type: "paragraph",
        content:
          "Many students work with coaches or attend workshops to sharpen their abilities before the tournament.",
      },
      {
        type: "subheading",
        content: "The DSDC Difference",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, our award-winning coaches specialize in preparing students for high-level competitions such as Canadian Nationals. With expertise in all major formats and a track record of success, we provide personalized coaching to help students excel. Whether your child is aiming to qualify or seeking to enhance their skills, we're here to support their journey. Book a free consultation today to learn more about our coaching programs!",
      },
    ],
  },
  {
    slug: "canadian-debate-formats",
    title: "Understanding High School Debate Formats in Canada",
    excerpt:
      "A guide to the four major debate formats used in Canadian high school competitions — CNDF, British Parliamentary, Cross-Examination, and World Schools — and how they challenge students differently.",
    date: "2025-01-22",
    author: "DSDC Team",
    category: "Competitive Debate",
    readTime: "4 min read",
    sections: [
      {
        type: "paragraph",
        content:
          "Debating is an incredible way for high school students to build critical thinking, public speaking, and teamwork skills. In Canada, several debate formats are popular, each offering unique rules and structures to challenge students' abilities. Here's a brief overview of the major formats.",
      },
      {
        type: "subheading",
        content: "1. Canadian National Debate Format (CNDF)",
      },
      {
        type: "paragraph",
        content:
          "CNDF is one of the most common formats for high school debating in Canada. It is a two-on-two format where tournaments will typically have 2 rounds where teams will prepare a given topic in advance, followed by rounds with impromptu topics. The first and second speaker on each team will give a constructive speech where the opposing team has the ability to offer questions known as POIs (Points of Information), followed by a shorter summary speech given by the first speaker of each side to conclude the debate. This format emphasizes logical argumentation, clear structure, and effective rebuttals. Debaters are judged on content, strategy, and style, making it an excellent choice for students to refine their persuasive skills.",
      },
      {
        type: "subheading",
        content: "2. British Parliamentary (BP) Debate",
      },
      {
        type: "paragraph",
        content:
          "BP format is typically geared towards high school students in grades 10–12, and is also the main format used in university debate tournaments worldwide. It features four teams of two debaters each, divided into four sides: Opening Government (OG), Opening Opposition (OO), Closing Government (CG) and Closing Opposition (CO). Each team competes to present the most compelling case, with the unique twist of being ranked against three other teams rather than a single opponent. This format demands adaptability, quick thinking, strategic planning, and the ability to work against various teams within a single round.",
      },
      {
        type: "subheading",
        content: "3. Cross-Examination Debate",
      },
      {
        type: "paragraph",
        content:
          "This format is used in the Regional, Provincial, and National Canadian debate tournaments, where two teams of two debaters each face off. What sets Cross-Examination apart is the emphasis on direct questioning between opposing debaters. This phase allows teams to clarify, challenge, or expose weaknesses in their opponents' arguments. Cross-Examination is ideal for students who enjoy dynamic interaction and thrive under the pressure of rapid exchanges.",
      },
      {
        type: "subheading",
        content: "4. World Schools Debate Format",
      },
      {
        type: "paragraph",
        content:
          "The World Schools format combines elements of British and North American debate traditions, creating a flexible and dynamic structure. Teams consist of three to five members in the prep room, and debates alternate between prepared and impromptu topics, with three members from each team debating against each other. This format's focus on teamwork and global issues makes it especially appealing for students interested in international perspectives and collaborative argumentation.",
      },
      {
        type: "subheading",
        content: "The DSDC Difference",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, our award-winning coaches are experts in all of these formats, bringing years of experience and success to the table. Whether your child is just starting or looking to master a specific debate style, we offer tailored coaching to meet their needs. Book a free consultation today to learn how we can help your child thrive in any debate format and take their skills to the next level!",
      },
    ],
  },
  {
    slug: "world-scholars-cup",
    title: "Exploring the World Scholar's Cup: A Global Competition for Future Leaders",
    excerpt:
      "Everything you need to know about the World Scholar's Cup — from Scholar's Bowl to the Tournament of Champions at Yale. Learn how DSDC maintains a 100% qualification rate.",
    date: "2025-01-21",
    author: "DSDC Team",
    category: "World Scholar's Cup",
    readTime: "7 min read",
    sections: [
      {
        type: "paragraph",
        content:
          "The World Scholar's Cup (WSC) is a unique, global academic competition designed to inspire curiosity, critical thinking, and collaboration among students from diverse cultures. Unlike traditional academic contests, the WSC challenges students to explore interdisciplinary topics, develop teamwork skills, and compete in a variety of exciting formats. More than just a competition, it's a journey of global discovery, resume-building, and holistic education.",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, we specialize in coaching students for WSC success. With award-winning, experienced WSC coaches and a 100% success rate since 2020 for teams qualifying from regionals to globals — and from globals to the Tournament of Champions — we're here to help you achieve your Scholar's Cup dreams.",
      },
      {
        type: "subheading",
        content: "What is the World Scholar's Cup?",
      },
      {
        type: "paragraph",
        content:
          "The WSC focuses on themes that span history, science, literature, arts, and social studies, encouraging students to think outside conventional academic silos. Open to students aged 10–18, the program combines academic rigor with an engaging, fun-filled environment. Participants form teams of three to compete across four dynamic events.",
      },
      {
        type: "subheading",
        content: "The Four Events",
      },
      {
        type: "list",
        content: "",
        items: [
          "Scholar's Bowl — A fast-paced, team-oriented quiz where participants answer challenging questions using clickers. The questions often involve multimedia components, puzzles, and collaboration.",
          "Team Debate — Students engage in three rounds of debates, alternating between affirmative and negative positions. Topics are drawn from the year's curriculum, requiring participants to argue persuasively and think critically.",
          "Collaborative Writing — Each team member chooses one of six topics to write an essay, blending creativity with argumentative writing. The event emphasizes teamwork, as students discuss and refine their ideas before writing individually.",
          "Scholar's Challenge — A rigorous multiple-choice test covering various subject areas in the year's curriculum. Students can select more than one answer per question, earning partial credit for partially correct responses.",
        ],
      },
      {
        type: "subheading",
        content: "The Pathway: Regionals, Globals, and Tournament of Champions",
      },
      {
        type: "paragraph",
        content:
          "The WSC offers an inclusive, multi-stage pathway for students to compete and grow on a global stage. The journey begins at Regional Rounds — local competitions held in schools or cities worldwide where teams compete in all four events to qualify for the Global Rounds. Global Rounds are held in major international cities (e.g., Bangkok, Dubai, and Cape Town), bringing together thousands of participants from over 50 countries. Beyond the competition, students engage in cultural exchanges, keynote speeches, and even a Scholar's Ball. The pinnacle is the Tournament of Champions (ToC), hosted at Yale University, where qualified teams compete at Yale's historic campus.",
      },
      {
        type: "paragraph",
        content:
          "With DSDC's expert coaching, every team we've coached has reached the Tournament of Champions since 2020 — a 100% qualification rate from regionals through globals to Yale.",
      },
      {
        type: "subheading",
        content: "Why Participate?",
      },
      {
        type: "list",
        content: "",
        items: [
          "Global Opportunity — Students connect with peers from around the world, fostering cultural understanding and global perspectives.",
          "Resume Building — Participation demonstrates intellectual curiosity, teamwork, and leadership — qualities that stand out on college applications.",
          "Holistic Education — The interdisciplinary curriculum encourages critical thinking, creativity, and real-world problem-solving, offering a well-rounded experience that traditional school programs rarely provide.",
        ],
      },
      {
        type: "subheading",
        content: "The DSDC Difference",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, we don't just prepare you for the competition — we prepare you for success. Our award-winning WSC coaches have years of experience, and our proven track record of excellence speaks for itself. From mastering the curriculum to excelling in every event, DSDC ensures you're fully equipped to reach your WSC goals. Join us and be part of a legacy of success, growth, and global opportunity!",
      },
    ],
  },
  {
    slug: "effective-study-techniques",
    title: "Mastering the Art of Studying: Effective Techniques to Save Time and Boost Learning",
    excerpt:
      "Stop studying harder and start studying smarter. Learn three scientifically proven techniques — spaced repetition, the Pomodoro Method, and active recall — to maximize your learning.",
    date: "2025-01-20",
    author: "DSDC Team",
    category: "Student Tips",
    readTime: "5 min read",
    sections: [
      {
        type: "paragraph",
        content:
          "Have you ever spent hours poring over textbooks, only to feel like nothing sticks? Many students fall into the trap of ineffective study habits, spending too much time with minimal results. The problem isn't lack of effort — it's not knowing how to study effectively. By incorporating scientifically proven techniques like spaced repetition, the Pomodoro Method, and active recall, you can study smarter, not harder. Here's how.",
      },
      {
        type: "subheading",
        content: "1. Spaced Repetition: The Key to Long-Term Retention",
      },
      {
        type: "paragraph",
        content:
          "Spaced repetition involves reviewing material at increasing intervals over time, capitalizing on how memory works. Instead of cramming, this method strengthens your recall each time you revisit the content, ensuring it transitions from short-term to long-term memory.",
      },
      {
        type: "list",
        content: "How to use spaced repetition:",
        items: [
          "Use tools like Anki or Quizlet, which automate spaced repetition schedules for flashcards",
          "After learning a new concept, review it the next day, then 3 days later, a week later, and so on",
          "For handwritten notes, create a schedule to revisit sections on specific days",
        ],
      },
      {
        type: "subheading",
        content: "2. The Pomodoro Method: Manage Time, Avoid Burnout",
      },
      {
        type: "paragraph",
        content:
          "The Pomodoro Method structures your study time into focused bursts of productivity followed by short breaks, making it easier to maintain focus and avoid procrastination.",
      },
      {
        type: "list",
        content: "How to use the Pomodoro Method:",
        items: [
          "Choose a task to focus on",
          "Set a timer for 25 minutes (one \"Pomodoro\")",
          "Work on the task until the timer goes off",
          "Take a 5-minute break",
          "After four Pomodoros, take a longer break (15–30 minutes)",
        ],
      },
      {
        type: "subheading",
        content: "3. Active Recall: Learning by Testing Yourself",
      },
      {
        type: "paragraph",
        content:
          "Active recall involves retrieving information from memory without looking at your notes or textbook. This process strengthens neural connections and ensures you truly understand the material.",
      },
      {
        type: "list",
        content: "How to use active recall:",
        items: [
          "Turn your notes into questions and quiz yourself regularly",
          "After reading a chapter, close the book and write down or say aloud everything you remember",
          "Practice answering past exam questions or creating mock tests",
        ],
      },
      {
        type: "subheading",
        content: "Why These Methods Save Time",
      },
      {
        type: "paragraph",
        content:
          "Most students waste time on passive techniques, like rereading and highlighting, which feel productive but yield minimal results. By switching to active recall, spaced repetition, and the Pomodoro Method, you'll learn faster by focusing on what matters, retain knowledge longer without endless review, and prevent burnout with manageable, efficient study sessions.",
      },
      {
        type: "subheading",
        content: "Final Thoughts",
      },
      {
        type: "paragraph",
        content:
          "Effective studying isn't about spending countless hours — it's about using the right strategies. By mastering spaced repetition, the Pomodoro Method, and active recall, you can maximize your study efforts and achieve your goals without sacrificing your free time. Give these methods a try and watch your efficiency — and grades — improve dramatically!",
      },
    ],
  },
  {
    slug: "public-speaking-benefits",
    title: "The Transformative Benefits of Improving Public Speaking Skills",
    excerpt:
      "Public speaking is the most common fear — but starting young changes everything. Discover how developing this skill boosts confidence, academic success, and career prospects.",
    date: "2025-01-18",
    author: "DSDC Team",
    category: "Public Speaking",
    readTime: "5 min read",
    sections: [
      {
        type: "paragraph",
        content:
          "Public speaking is a powerful tool that extends beyond the podium, influencing various aspects of personal and professional life. Enhancing your public speaking abilities can lead to numerous benefits, including increased confidence, career advancement, and personal development. Let's delve into these advantages!",
      },
      {
        type: "subheading",
        content: "Public Speaking: The Most Common Fear",
      },
      {
        type: "paragraph",
        content:
          "Public speaking is often cited as the most common phobia, even more prevalent than the fear of death. Research indicates that a significant percentage of people experience anxiety when faced with the prospect of speaking in front of an audience. However, exposure to public speaking from a young age can help individuals build resilience and confidence, reducing this anxiety over time. By starting early, children and teens can become comfortable with expressing their thoughts clearly and persuasively, laying the foundation for future success.",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, we emphasize the importance of starting young. Our classes provide a safe and supportive environment where children and teens can practice public speaking, overcome their fears, and build the confidence to communicate effectively.",
      },
      {
        type: "subheading",
        content: "1. Boosts Confidence",
      },
      {
        type: "paragraph",
        content:
          "Developing public speaking skills significantly enhances self-confidence. Overcoming the fear of speaking in front of an audience empowers individuals, making them more assertive and self-assured in various situations. This newfound confidence often translates into better performance in both personal and professional settings.",
      },
      {
        type: "subheading",
        content: "2. Academic Advancement",
      },
      {
        type: "paragraph",
        content:
          "Public speaking and debate play a vital role in academic success. Mastering these skills enhances critical thinking, logical reasoning, and the ability to articulate ideas, all of which are essential for excelling in school. Competitive debate, in particular, helps students develop research skills, construct persuasive arguments, and adapt to different perspectives, making them stand out in academic settings.",
      },
      {
        type: "paragraph",
        content:
          "Participation in public speaking and debate competitions can also significantly boost a student's university applications and scholarship opportunities. Admissions committees and scholarship boards value these experiences as they demonstrate leadership, intellectual curiosity, and the ability to communicate effectively.",
      },
      {
        type: "subheading",
        content: "3. Career Advancement",
      },
      {
        type: "paragraph",
        content:
          "Proficiency in public speaking is a valuable asset in the professional world. It demonstrates qualities such as leadership, critical thinking, and poise — attributes that are highly sought after in the job market. Effective communicators are often considered for promotions and leadership roles due to their ability to articulate ideas clearly and persuade others.",
      },
      {
        type: "subheading",
        content: "4. Personal Development",
      },
      {
        type: "paragraph",
        content:
          "Engaging in public speaking fosters personal growth by enhancing communication skills, critical thinking, and the ability to engage with diverse audiences. It encourages individuals to organize their thoughts, present arguments logically, and connect with listeners emotionally, leading to overall personal enrichment.",
      },
      {
        type: "subheading",
        content: "The DSDC Difference",
      },
      {
        type: "paragraph",
        content:
          "At DSDC, we are dedicated to nurturing confidence, self-esteem, and effective communication in children and teens through our specialized public speaking and debate classes. Our award-winning instructors use engaging and proven methods to help young learners overcome their fears, develop strong communication skills, and excel in both academic and professional contexts. We don't just teach public speaking — we transform students into confident leaders, skilled debaters, and persuasive communicators.",
      },
      {
        type: "paragraph",
        content:
          "Start building your confidence today — join a DSDC public speaking class and discover the transformative power of effective communication!",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** Reads from content/blog-posts.json if it exists (e.g. after admin save); otherwise returns static blogPosts. Use in server components or API routes. */
export function getBlogPostsSync(): BlogPost[] {
  if (typeof window !== "undefined") return blogPosts;
  try {
    const path = require("path");
    const fs = require("fs");
    const p = path.join(process.cwd(), "content", "blog-posts.json");
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      return Array.isArray(data) ? data : blogPosts;
    }
  } catch (error) {

    console.error("[blog-posts] error:", error);
    // ignore
  }
  return blogPosts;
}
