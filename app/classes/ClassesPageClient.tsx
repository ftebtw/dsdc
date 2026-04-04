"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Globe, Mic, Swords, GraduationCap, Clock, Users, MessageSquare, CheckCircle, ClipboardList } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { addZhPrefix, hasChineseVersion } from "@/lib/localeRouting";
import AnimatedSection from "@/components/AnimatedSection";

const classIcons = [BookOpen, Swords, GraduationCap, Trophy, Globe, Mic];
const classImages = [
  "/images/photos/wsc-students-1.jpg",
  "/images/photos/wsc-students-2.jpg",
  "/images/photos/wsc-group-2.jpg",
  "/images/photos/wsc-students-3.jpg",
  "/images/photos/wsc-students-4.jpg",
  "/images/photos/dsdc-class-photo.jpg",
];
const typicalIcons = [Users, Clock, BookOpen, Swords, MessageSquare, ClipboardList];

function classImageAlt(className: string): string {
  const normalized = className.toLowerCase();
  if (normalized.includes("novice")) return "Online debate class for elementary school students";
  if (normalized.includes("junior")) return "Online debate class for middle school students";
  if (normalized.includes("senior") || normalized.includes("advanced")) return "Competitive debate training for high school students";
  if (normalized.includes("world scholar") || normalized.includes("wsc")) return "DSDC students at the World Scholar's Cup competition";
  if (normalized.includes("public speaking")) return "Online public speaking class for students";
  return "Students participating in an online debate class";
}

function getExpandedClassDescription(className: string, locale: string): string | null {
  const normalized = className.toLowerCase();

  if (locale === "zh") {
    if (normalized.includes("novice")) {
      return "学生会从观点表达、论点结构、反驳基础和礼貌发言开始，在支持性很强的课堂里逐步建立自信。这一级别尤其适合零基础或害羞的孩子，让他们先喜欢上表达，再慢慢进入更系统的辩论训练。";
    }
    if (normalized.includes("junior")) {
      return "这一阶段会明显提升学生的分析深度与应变速度。孩子会开始接触更复杂的话题，学习如何比较论点强弱、处理对方反驳，并在有限准备时间内更清晰地组织内容。";
    }
    if (normalized.includes("senior")) {
      return "Senior 阶段面向已经具备一定基础、希望把表达与论证提升到更高层次的学生。课程会更强调比赛节奏、复杂议题研究、战略判断，以及更成熟的演讲风格。";
    }
    if (normalized.includes("advanced")) {
      return "Advanced Competitive 更接近高水平竞赛训练。学生会进行高密度练习、深度复盘、精细化反馈和更高要求的案例构建，适合目标明确、愿意投入训练的学生。";
    }
    if (normalized.includes("world scholar") || normalized.includes("wsc")) {
      return "世界学者杯课程不仅帮助学生备赛，也会训练他们跨学科阅读、快速整理信息和团队协作能力。很多家庭选择这一项目，是因为它能同时兼顾学术拓展和比赛成果。";
    }
    if (normalized.includes("public speaking")) {
      return "公共演讲课程更重视台风、自信、结构表达和现场反应，适合想先提升表达力、再逐步进入辩论的学生。很多孩子会先在这里建立声音与节奏感，再转入更正式的辩论课程。";
    }
    return null;
  }

  if (normalized.includes("novice")) {
    return "Students build their foundation through low-pressure drills in speech structure, rebuttal, and clear explanation. This is the level parents usually choose when they want debate classes for kids that feel supportive first and competitive second.";
  }
  if (normalized.includes("junior")) {
    return "At this stage, students start handling more sophisticated motions and faster-paced exchanges. Families often choose junior debate when they want a debate course online that strengthens both school confidence and competitive readiness.";
  }
  if (normalized.includes("senior")) {
    return "Senior students work on sharper comparison, deeper research, and more advanced strategic decision-making. This level is a strong fit for teenagers who want debate training for kids that feels academically rigorous and tournament relevant.";
  }
  if (normalized.includes("advanced")) {
    return "Advanced competitive classes focus on high-volume practice rounds, detailed debriefs, and refined case-building. Students here are usually aiming for top tournament results and want coaching that mirrors serious competitive preparation.";
  }
  if (normalized.includes("world scholar") || normalized.includes("wsc")) {
    return "The World Scholar's Cup pathway blends debate, writing, collaborative problem-solving, and interdisciplinary academic thinking. It is ideal for families who want both competition preparation and a broader enrichment experience.";
  }
  if (normalized.includes("public speaking")) {
    return "Public speaking students work on delivery, speech organization, voice control, and audience awareness in a small-group setting. Many families choose this class as a confidence-building bridge before moving into full debate.";
  }

  return null;
}

export default function ClassesPage() {
  const { t, messages, locale } = useI18n();
  const localizeHref = (href: string) => (locale === "zh" && hasChineseVersion(href) ? addZhPrefix(href) : href);
  const classes = ((messages.classesPage as { classes?: Array<{
    name: string;
    grades: string;
    schedule?: string;
    category: string;
    description: string;
  }> } | undefined)?.classes ?? []) as Array<{
    name: string;
    grades: string;
    schedule?: string;
    category: string;
    description: string;
  }>;
  const typicalItems = ((messages.classesPage as {
    typicalClassItems?: Array<{ title: string; description: string }>;
  } | undefined)?.typicalClassItems ?? []) as Array<{ title: string; description: string }>;
  const testimonialItems = ((messages.testimonials as {
    items?: Array<{ name: string; role: string; quote: string }>;
  } | undefined)?.items ?? []).slice(0, 3) as Array<{ name: string; role: string; quote: string }>;

  const debateClasses = classes.filter((c) => c.category === "debate");
  const otherClasses = classes.filter((c) => c.category === "other");
  const seoFaqItems =
    locale === "zh"
      ? [
          {
            question: "哪些学生适合报名 DSDC 的在线辩论课程？",
            answer:
              "我们的课程适合 4 至 12 年级的学生，从零基础入门到高水平竞赛训练都有清晰路径。无论孩子想提升自信、写作能力还是比赛成绩，都可以找到合适级别。",
          },
          {
            question: "你们同时提供辩论课和公共演讲课程吗？",
            answer:
              "提供。家长可以选择在线辩论课程、公共演讲课程、世界学者杯备赛以及高级竞赛项目，我们会根据年龄与经验推荐最合适的课程。",
          },
          {
            question: "一门公共演讲或辩论课程通常包含什么？",
            answer:
              "大多数课程会包含热身活动、时事或沟通技巧讲解、结构化演讲或辩论练习，以及课后书面反馈，让学生每周都知道自己如何进步。",
          },
          {
            question: "害羞或完全没有经验的学生适合吗？",
            answer:
              "非常适合。很多学生都是零基础开始的。我们的入门课程会用支持性强、循序渐进的方式帮助学生建立表达自信。",
          },
          {
            question: "和短期夏令营式 debate camp 相比，有什么不同？",
            answer:
              "短期营队可以帮助孩子快速接触辩论，但按学期进行的课程通常更能带来长期成长，因为学生会持续练习、反复获得反馈，并逐步晋级到更高水平。",
          },
          {
            question: "如何判断孩子适合哪一门课？",
            answer:
              "最好的方式是先比较课程层级，或者预约免费咨询。我们会根据孩子的年级、表达自信和目标，推荐最合适的课程。",
          },
          {
            question: "课后会有作业吗？",
            answer:
              "会有，但通常不会太重。多半是短篇准备任务、观点整理、演讲提纲或研究练习，目的是帮助学生把课堂内容真正转化成能力。",
          },
          {
            question: "你们如何衡量孩子的进步？",
            answer:
              "我们会结合课堂表现、书面反馈、阶段性观察和必要时的家长沟通来追踪成长。家长通常能在一个学期内明显看到孩子在表达、自信和论证上的变化。",
          },
        ]
      : [
          {
            question: "What students are your online debate classes best for?",
            answer:
              "Our programs are designed for students in Grades 4 through 12, from complete beginners to highly competitive debaters. Families choose DSDC when they want confidence-building, academic growth, and structured coaching.",
          },
          {
            question: "Do you offer both debate classes and a public speaking course?",
            answer:
              "Yes. We offer online debate classes, a dedicated public speaking course, World Scholar's Cup coaching, and advanced competitive programs for students who want more rigorous training.",
          },
          {
            question: "What happens in a typical debate or public speaking class?",
            answer:
              "Students usually begin with a warm-up or lesson, then move into structured speeches, practice debates, or presentation drills. Coaches provide written feedback after class so students know exactly what to improve.",
          },
          {
            question: "Are these debate classes for kids beginner-friendly?",
            answer:
              "Absolutely. Many students start with no experience at all. Our novice and public speaking options are designed to help shy students build skill and confidence gradually.",
          },
          {
            question: "How do these programs compare with a debate camp?",
            answer:
              "A debate camp can be a useful introduction, but weekly classes usually lead to stronger results because students practice over an entire term, receive repeated feedback, and move through a clear progression of levels.",
          },
          {
            question: "How do we choose the right class and get started?",
            answer:
              "Start by comparing the class levels or booking a free consultation. We'll recommend the right fit based on your child's grade, confidence level, and long-term goals.",
          },
          {
            question: "How much homework should we expect each week?",
            answer:
              "Homework is usually short and focused: a case outline, a research task, or a speaking exercise that reinforces the week's lesson. It is designed to support progress without overwhelming students.",
          },
          {
            question: "How do you measure student progress over time?",
            answer:
              "We track progress through live class performance, written feedback, coach observation, and longer-term growth in confidence, structure, and argument quality. Families usually notice clear changes over the course of a term.",
          },
        ];

  const levelDetails =
    locale === "zh"
      ? [
          {
            title: "Novice: 建立表达自信与基础结构",
            text: "Novice 适合 4 至 6 年级、刚开始接触辩论的学生。孩子会学习如何清楚表达观点、搭建简单论点、使用基本证据，并在支持性强的环境中逐步适应公开发言。",
          },
          {
            title: "Junior: 从会说到会分析",
            text: "Junior 阶段会把课堂要求提升到更接近真实比赛与学术讨论的层次。学生开始处理更复杂的时事和社会议题，学习如何回应反方、比较影响，并把思考讲得更有层次。",
          },
          {
            title: "Senior: 更成熟的比赛与学术表达",
            text: "Senior 面向已经具备一定辩论经验的学生。课程会训练更高阶的战略判断、议题拆解、复杂论证和更成熟的演讲风格，帮助学生在高中阶段脱颖而出。",
          },
          {
            title: "Advanced: 高强度竞技训练",
            text: "Advanced Competitive 适合目标明确、准备长期投入比赛训练的学生。这里会有更密集的实战、复盘、案例精修和个性化反馈，帮助学生冲击更高水平赛事。",
          },
        ]
      : [
          {
            title: "Novice: Confidence, structure, and first speaking habits",
            text: "Our novice level is designed for younger students who are new to debate classes for kids. Students learn how to make a clear claim, support it with reasons, listen actively, and speak in a structured way without feeling rushed into high-pressure competition.",
          },
          {
            title: "Junior: Stronger reasoning and faster responses",
            text: "Junior classes move students from basic confidence into sharper thinking. They begin working with more challenging motions, learn how to respond to opposing arguments, and practice organizing ideas more quickly in a live discussion setting.",
          },
          {
            title: "Senior: Advanced argumentation for older students",
            text: "Senior students are expected to analyze issues with more nuance and independence. They practice complex comparative reasoning, deeper research habits, and more polished delivery in formats that matter for school and tournament debate.",
          },
          {
            title: "Advanced: High-level competitive preparation",
            text: "The advanced level is for students who want serious debate training for kids that feels close to elite tournament practice. These classes emphasize strategic depth, efficient prep, rigorous feedback, and the kind of repetition that leads to measurable competitive growth.",
          },
        ];

  const skillItems =
    locale === "zh"
      ? [
          {
            title: "批判性思维",
            text: "学生学会拆解问题、比较观点，并在复杂议题中快速抓住核心。",
          },
          {
            title: "说服与论证",
            text: "孩子会学习如何把自己的想法讲得更有逻辑、更有说服力，而不是只停留在直觉表达。",
          },
          {
            title: "研究与信息整理",
            text: "辩论训练会提升学生查找资料、筛选证据和快速组织信息的能力。",
          },
          {
            title: "公开表达",
            text: "从声音、节奏到结构和台风，学生会持续练习更清楚、更自信地表达。",
          },
          {
            title: "团队协作",
            text: "在搭档和小组讨论中，学生学会倾听、分工、合作与共同构建案例。",
          },
        ]
      : [
          {
            title: "Critical thinking",
            text: "Students learn how to break big questions into smaller parts, compare competing ideas, and make clearer judgments under pressure.",
          },
          {
            title: "Persuasion",
            text: "Children practice turning opinions into organized arguments that are easier for teachers, peers, and judges to follow.",
          },
          {
            title: "Research",
            text: "Debate builds the habit of finding useful evidence, sorting information quickly, and supporting claims with stronger reasoning.",
          },
          {
            title: "Public speaking",
            text: "Students become more comfortable speaking live, projecting confidence, and structuring a message so people actually listen.",
          },
          {
            title: "Teamwork",
            text: "Partner and group exercises teach students how to listen, divide responsibilities, and build stronger ideas together.",
          },
        ];

  const progressItems =
    locale === "zh"
      ? [
          {
            title: "每周书面反馈",
            text: "学生课后会收到可回看的书面建议，知道自己哪里做得好、下一步应该提升什么。",
          },
          {
            title: "课堂中的即时纠正",
            text: "教练会在练习和回顾中及时指出结构、表达和论证上的问题，帮助学生当场调整。",
          },
          {
            title: "长期成长观察",
            text: "我们不会只看某一节课的表现，而是关注一个学期中自信、思维速度和表达成熟度的变化。",
          },
          {
            title: "家长更容易看见进步",
            text: "因为课程有清晰结构与反馈记录，家长通常更容易理解孩子在课堂里具体学到了什么。",
          },
        ]
      : [
          {
            title: "Written feedback after class",
            text: "Students receive specific notes they can revisit instead of relying only on what they remember from class.",
          },
          {
            title: "Live correction during practice",
            text: "Coaches adjust structure, delivery, and strategy in real time so students can improve while the skill is still fresh.",
          },
          {
            title: "Term-long growth, not one-off moments",
            text: "We care about how a student develops across a semester: confidence, clarity, research habits, and the quality of argumentation.",
          },
          {
            title: "Progress that parents can understand",
            text: "Because the feedback is concrete, parents get a clearer picture of what their child is learning and where the growth is happening.",
          },
        ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Online Debate & Public Speaking Classes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white/80 font-sans mb-4"
          >
            {t("classesPage.subtitle")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base text-gold-400 font-sans"
          >
            {t("classesPage.online")}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm sm:text-base text-white/85 font-sans mt-4"
          >
            DSDC offers online debate and public speaking classes for students of all ages and experience levels - no experience needed.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={localizeHref("/compare")}
              className="px-8 py-3.5 bg-gold-300 text-navy-900 font-semibold rounded-lg
                         hover:bg-gold-200 transition-all duration-200 shadow-md text-center"
            >
              {t("classesPage.compareCta")}
            </Link>
            <Link
              href={localizeHref("/book")}
              className="px-8 py-3.5 border border-white text-white font-semibold rounded-lg
                         hover:bg-white hover:text-navy-800 transition-all duration-200 text-center"
            >
              {t("classesPage.bookCta")}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-navy-800 dark:text-white">
              {locale === "zh" ? "为什么家长选择 DSDC 在线辩论课程" : "Online Debate Classes for Kids That Build Real Skills"}
            </h2>
          </AnimatedSection>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            {locale === "zh" ? (
              <>
                <p>
                  很多家长在寻找在线辩论课程时，并不只是想要一项课外活动，而是希望孩子能持续建立自信、表达能力和批判性思维。DSDC 的课程正是围绕这些长期能力来设计的，让学生在每周稳定练习中不断成长。
                </p>
                <p>
                  我们的课程体系包含适合低龄学生的辩论入门课、专门提升舞台表现力的公共演讲课程，以及面向高水平学生的竞技辩论训练。无论您是在寻找适合初学者的课程，还是更系统的长期训练路径，都可以在这里找到清晰的下一步。
                </p>
                <p>
                  也有家长最初是通过搜索类似 debate camp 的短期项目来接触辩论。短期营队当然有价值，但按学期进行的课程通常更能帮助孩子真正进步，因为他们能在更长时间里反复实践、获得反馈，并把技能变成稳定习惯。
                </p>
                <p>
                  如果您正在比较不同选择，可以查看我们的{" "}
                  <Link href={localizeHref("/online-debate-classes")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    在线辩论课程页面
                  </Link>
                  、了解{" "}
                  <Link href={localizeHref("/debate-classes-vancouver")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    温哥华辩论课程
                  </Link>
                  ，或者直接{" "}
                  <Link href={localizeHref("/book")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    预约免费咨询
                  </Link>
                  ，我们会帮助您找到最适合孩子的项目。
                </p>
              </>
            ) : (
              <>
                <p>
                  Families searching for online debate classes usually want more than a one-time enrichment activity.
                  They want debate classes for kids that build confidence, strengthen critical thinking, and turn
                  speaking practice into a weekly habit. That is exactly how DSDC designs its programs.
                </p>
                <p>
                  Our lineup includes beginner-friendly debate classes for kids, a dedicated public speaking course for
                  students who want stage confidence first, and advanced competitive training for debaters aiming at
                  provincials, nationals, and international tournaments. We also offer a clear pathway from beginner
                  fundamentals to high-level debate coaching.
                </p>
                <p>
                  Some parents begin by searching for a debate camp or short summer intensive. Those can be a helpful
                  spark, but term-based programs usually create stronger improvement because students practice across an
                  entire semester, receive written feedback every week, and progress through clearly defined levels.
                </p>
                <p>
                  If you&apos;re comparing options, explore our{" "}
                  <Link href={localizeHref("/online-debate-classes")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    online debate classes
                  </Link>
                  , learn about our{" "}
                  <Link href={localizeHref("/debate-classes-vancouver")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    Vancouver debate classes
                  </Link>
                  , or{" "}
                  <Link href={localizeHref("/book")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    book a free consultation
                  </Link>
                  {" "}and we&apos;ll recommend the right fit.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "各个层级的学生会学到什么" : "What Students Learn at Each Level"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {levelDetails.map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 0.08}>
                <article className="h-full rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">{item.title}</h3>
                  <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.18}>
            <p className="mt-8 text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
              {locale === "zh" ? (
                <>
                  如果您正在比较不同级别，可以先查看{" "}
                  <Link href={localizeHref("/pricing")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    课程价格
                  </Link>
                  、了解{" "}
                  <Link href={localizeHref("/team")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    教练团队
                  </Link>
                  ，或者阅读我们的{" "}
                  <Link href="/guide-to-debate-in-canada" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    加拿大辩论指南
                  </Link>
                  。
                </>
              ) : (
                <>
                  If you&apos;re comparing levels, it helps to review our{" "}
                  <Link href={localizeHref("/pricing")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    pricing
                  </Link>
                  , meet the coaches on our{" "}
                  <Link href={localizeHref("/team")} className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    team page
                  </Link>
                  , and read our{" "}
                  <Link href="/guide-to-debate-in-canada" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                    guide to debate in Canada
                  </Link>
                  {" "}for a better sense of the long-term pathway.
                </>
              )}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "孩子会发展哪些核心能力" : "Skills Your Child Will Develop"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {skillItems.map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <article className="h-full rounded-2xl border border-warm-200 bg-warm-50 p-5 dark:border-navy-700 dark:bg-navy-800">
                  <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-3 font-serif">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.12}>
            <p className="mt-8 text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
              {locale === "zh"
                ? "这也是为什么很多家长把辩论课视为长期能力训练，而不是普通兴趣班。孩子在辩论课中获得的不只是比赛技巧，更是会迁移到课堂讨论、写作、演讲、面试和领导力活动中的思考与表达能力。"
                : "This is why many parents treat debate classes for kids as long-term academic training rather than just another enrichment activity. The gains show up in essays, class discussions, presentations, interviews, and leadership opportunities because the underlying skills are broadly useful."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* What a Typical Class Looks Like */}
      <section className="py-20 md:py-28 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 md:mb-16 text-navy-800 dark:text-white">
              {locale === "zh" ? "典型的一周课程安排" : "Typical Class Schedule"}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.04}>
            <p className="mx-auto mb-10 max-w-4xl text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
              {locale === "zh"
                ? "大多数课程每周按照相似节奏推进：先通过热身进入状态，再讲解本周重点技能，接着进行结构化练习，最后由教练给出具体反馈与后续任务。这样的安排既帮助学生建立安全感，也让成长更稳定。"
                : "Most classes follow a reliable weekly rhythm: students warm up, learn a focused communication skill, practice it live, and then receive feedback they can act on before the next session. That consistency is one reason an online debate course often works better than a one-off workshop or debate camp."}
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-fr">
            {typicalItems.map((item, i) => {
              const Icon = typicalIcons[i];
              return (
                <AnimatedSection key={i} delay={i * 0.08} className="h-full">
                  <div className="h-full min-h-[220px] sm:min-h-[230px] text-center p-5 sm:p-6 md:p-8 rounded-2xl bg-warm-50 dark:bg-navy-800 border border-warm-200 dark:border-navy-700 flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gold-400/10 dark:bg-gold-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold-500 dark:text-gold-400" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-navy-800 dark:text-white mb-2 font-serif min-h-[2.5rem] flex items-center justify-center">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-charcoal/50 dark:text-navy-300 font-sans leading-relaxed max-w-[34ch] mx-auto flex-1">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          {/* Pricing note */}
          <AnimatedSection delay={0.3}>
            <div className="mt-10 md:mt-12 text-center">
              <p className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-gold-50 dark:bg-gold-900/30 border border-gold-200 dark:border-gold-700 rounded-2xl text-sm sm:text-base text-gold-700 dark:text-gold-300 font-medium font-sans text-center leading-relaxed max-w-2xl mx-auto">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {t("classesPage.pricingNote")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Debate Classes */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
              {t("classesPage.debateTitle")}
            </h2>
          </AnimatedSection>

          <div className="space-y-12">
            {debateClasses.map((cls, i) => {
              const Icon = classIcons[i % classIcons.length];
              const image = classImages[i % classImages.length];
              const isEven = i % 2 === 0;
              const isNoviceClass = i === 0 || /novice/i.test(cls.name);
              const expandedDescription = getExpandedClassDescription(cls.name, locale);
              return (
                <AnimatedSection key={cls.name} delay={i * 0.1}>
                  <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}>
                    <div className="w-full lg:w-1/2">
                      <div className="rounded-2xl overflow-hidden aspect-[16/10] shadow-lg">
                        <Image
                          src={image}
                          alt={classImageAlt(cls.name)}
                          width={600}
                          height={400}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <span className="px-3 py-1 bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 text-xs font-semibold rounded-full">
                          {cls.grades}
                        </span>
                        {cls.schedule && (
                          <span className="hidden sm:flex px-3 py-1 bg-gold-50 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 text-xs font-medium rounded-full items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.schedule}
                          </span>
                        )}
                      </div>
                      {cls.schedule && (
                        <p className="sm:hidden text-xs text-gold-600 dark:text-gold-400 font-medium mb-2 font-sans flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.schedule}
                        </p>
                      )}
                      <h3 className="text-2xl md:text-3xl font-bold text-navy-800 dark:text-white mb-4 font-serif">
                        {cls.name}
                      </h3>
                      <p className="text-charcoal/70 dark:text-navy-200 leading-relaxed text-lg font-sans">
                        {cls.description}
                      </p>
                      {expandedDescription ? (
                        <p className="mt-4 text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">
                          {expandedDescription}
                        </p>
                      ) : null}
                      {isNoviceClass ? (
                        <p className="mt-3 text-sm font-medium text-navy-700 dark:text-gold-300">
                          New to debate?{" "}
                          <Link href="/debate-classes-for-beginners" className="underline underline-offset-4 hover:text-gold-400 transition-colors">
                            Perfect for beginners
                          </Link>
                          .
                        </p>
                      ) : null}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "我们如何衡量学生进步" : "How We Measure Progress"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {progressItems.map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <article className="h-full rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-3 font-serif">{item.title}</h3>
                  <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                </article>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={0.14}>
            <p className="mt-8 text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
              {locale === "zh" ? (
                <>
                  如果您重视可见的成长轨迹，这种反馈机制会非常重要。很多家长会把这里与短期训练营、一次性活动或缺少个别反馈的大班课做比较，然后发现按学期推进的课程更容易真正看见进步。
                </>
              ) : (
                <>
                  If visible progress matters to your family, this kind of feedback system is a major advantage. It is one reason parents often prefer term-based coaching over a one-off debate camp or a larger class where improvement is harder to measure week to week.
                </>
              )}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Other Classes */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-800 dark:text-white">
              {t("classesPage.otherTitle")}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:auto-rows-fr">
            {otherClasses.map((cls, i) => {
              const Icon = classIcons[(i + 4) % classIcons.length];
              const image = classImages[(i + 4) % classImages.length];
              const isWscClass = /world scholar|wsc/i.test(`${cls.name} ${cls.description}`);
              const expandedDescription = getExpandedClassDescription(cls.name, locale);
              return (
                <AnimatedSection key={cls.name} delay={i * 0.15} className="h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-warm-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-navy-800">
                    <div className="aspect-[16/9] shrink-0 overflow-hidden">
                      <Image
                        src={image}
                        alt={classImageAlt(cls.name)}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-8">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gold-500" />
                        </div>
                        <span className="px-3 py-1 bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 text-xs font-semibold rounded-full">
                          {cls.grades}
                        </span>
                        {cls.schedule && (
                          <span className="hidden sm:flex px-3 py-1 bg-gold-50 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 text-xs font-medium rounded-full items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.schedule}
                          </span>
                        )}
                      </div>
                      {cls.schedule && (
                        <p className="sm:hidden text-xs text-gold-600 dark:text-gold-400 font-medium mb-2 font-sans flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.schedule}
                        </p>
                      )}
                      <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">{cls.name}</h3>
                      <p className="flex-1 text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">{cls.description}</p>
                      {expandedDescription ? (
                        <p className="mt-4 text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">{expandedDescription}</p>
                      ) : null}
                      {isWscClass ? (
                        <p className="mt-3 text-sm font-medium text-navy-700 dark:text-gold-300">
                          {" "}
                          <Link href="/world-scholars-cup-coaching" className="underline underline-offset-4 hover:text-gold-400 transition-colors">
                            Learn more about our WSC coaching
                          </Link>
                          .
                        </p>
                      ) : null}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "学生和家庭如何评价 DSDC" : "What Families Say About DSDC"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonialItems.map((item, index) => (
              <AnimatedSection key={`${item.name}-${index}`} delay={index * 0.08} className="h-full">
                <article className="h-full rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  <p className="text-base leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-5 border-t border-warm-200 pt-4 dark:border-navy-700">
                    <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                    <p className="text-sm text-charcoal/55 dark:text-navy-300">{item.role}</p>
                  </div>
                </article>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "继续了解辩论与课程选择" : "Learn More About Debate"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                href: "/blog/canadian-debate-formats",
                title:
                  locale === "zh" ? "加拿大常见辩论赛制" : "Understanding Canadian Debate Formats",
                text:
                  locale === "zh"
                    ? "了解 CNDF、BP、Cross-Examination 和 World Schools 的区别。"
                    : "Learn how CNDF, BP, Cross-Examination, and World Schools differ.",
              },
              {
                href: "/blog/debate-classes-cost",
                title:
                  locale === "zh" ? "辩论课程价格应该怎么看" : "How Much Should Debate Classes Cost?",
                text:
                  locale === "zh"
                    ? "比较课程价值时，除了价格，还应该关注反馈、班级规模和教学质量。"
                    : "Compare pricing with feedback quality, class size, and overall coaching value.",
              },
              {
                href: "/blog/online-vs-in-person-debate-classes",
                title:
                  locale === "zh" ? "在线辩论课 vs 线下辩论课" : "Online vs In-Person Debate Classes",
                text:
                  locale === "zh"
                    ? "看看为什么很多家庭更重视长期可持续性，而不只是上课地点。"
                    : "See why many families care more about consistency and coaching than location alone.",
              },
            ].map((item, index) => (
              <AnimatedSection key={item.href} delay={index * 0.08}>
                <Link
                  href={localizeHref(item.href)}
                  className="block h-full rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm transition-colors hover:border-gold-300 hover:bg-white dark:border-navy-700 dark:bg-navy-800 dark:hover:border-gold-400 dark:hover:bg-navy-700"
                >
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "按地区了解 DSDC 辩论课程" : "Explore DSDC by Region"}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                href: "/debate-classes-vancouver",
                title: locale === "zh" ? "温哥华与大温地区" : "Vancouver & Lower Mainland",
                text:
                  locale === "zh"
                    ? "查看我们面向温哥华、本拿比、列治文、素里等地区家庭的辩论课程页面。"
                    : "See our Vancouver-founded debate and public speaking page for families across the Lower Mainland.",
              },
              {
                href: "/debate-classes-toronto",
                title: locale === "zh" ? "多伦多与 GTA" : "Toronto & GTA",
                text:
                  locale === "zh"
                    ? "查看面向多伦多、Brampton、Mississauga、Markham 等地区学生的专门页面。"
                    : "Explore our Toronto and GTA landing page for families in Brampton, Mississauga, Markham, and beyond.",
              },
              {
                href: "/debate-classes-calgary",
                title: locale === "zh" ? "卡尔加里" : "Calgary",
                text:
                  locale === "zh"
                    ? "了解阿省家庭如何通过线上课程获得更稳定的辩论训练。"
                    : "See how Calgary families use DSDC for consistent debate coaching without commute-heavy schedules.",
              },
              {
                href: "/debate-classes-ottawa",
                title: locale === "zh" ? "渥太华" : "Ottawa",
                text:
                  locale === "zh"
                    ? "查看渥太华学生如何通过在线课程提升表达、自信和辩论能力。"
                    : "Read how Ottawa students use online debate training to build stronger communication and reasoning.",
              },
              {
                href: "/debate-classes-ontario",
                title: locale === "zh" ? "安大略省" : "Ontario",
                text:
                  locale === "zh"
                    ? "如果你在 GTA 之外，也可以查看我们面向全安省家庭的页面。"
                    : "If you're outside the GTA, our Ontario page gives a broader province-wide view of the program.",
              },
              {
                href: "/debate-classes-alberta",
                title: locale === "zh" ? "阿尔伯塔省" : "Alberta",
                text:
                  locale === "zh"
                    ? "了解阿省不同城市家庭如何使用 DSDC 的线上辩论与公共演讲课程。"
                    : "Explore how Alberta families in Calgary, Edmonton, and beyond use DSDC's online debate pathway.",
              },
            ].map((item, index) => (
              <AnimatedSection key={item.href} delay={index * 0.06}>
                <Link
                  href={localizeHref(item.href)}
                  className="block h-full rounded-2xl border border-warm-200 bg-white p-6 shadow-sm transition-colors hover:border-gold-300 hover:bg-warm-50 dark:border-navy-700 dark:bg-navy-800 dark:hover:border-gold-400 dark:hover:bg-navy-700"
                >
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-3 font-serif">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {locale === "zh" ? "课程常见问题" : "Class FAQs"}
            </h2>
          </AnimatedSection>
          <div className="space-y-3">
            {seoFaqItems.map((item, index) => (
              <AnimatedSection key={item.question} delay={index * 0.04}>
                <details className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-4 sm:p-5 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50">
                    <span className="pr-4 text-sm sm:text-base font-semibold text-navy-800 dark:text-navy-100 font-sans">
                      {item.question}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-navy-600">
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 sm:px-5 sm:pb-5 sm:text-base font-sans">
                    {item.answer}
                  </p>
                </details>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Not Sure CTA */}
      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{t("classesPage.unsure")}</h2>
            <p className="text-white/75 font-sans mb-8">
              {t("classesPage.comparePrompt")}
            </p>
            <p className="text-white/75 font-sans mb-8 leading-relaxed">
              {locale === "zh" ? (
                <>
                  也可以先查看{" "}
                  <Link href={localizeHref("/pricing")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                    课程价格
                  </Link>
                  、了解{" "}
                  <Link href={localizeHref("/team")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                    教练团队
                  </Link>
                  ，或者阅读我们关于{" "}
                  <Link
                    href="/blog/best-debate-programs-vancouver"
                    className="underline underline-offset-4 hover:text-gold-300 transition-colors"
                  >
                    如何选择辩论课程
                  </Link>
                  的文章。
                </>
              ) : (
                <>
                  You can also review our{" "}
                  <Link href={localizeHref("/pricing")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                    pricing
                  </Link>
                  , meet the coaches on our{" "}
                  <Link href={localizeHref("/team")} className="underline underline-offset-4 hover:text-gold-300 transition-colors">
                    team page
                  </Link>
                  , or read our article on{" "}
                  <Link
                    href="/blog/best-debate-programs-vancouver"
                    className="underline underline-offset-4 hover:text-gold-300 transition-colors"
                  >
                    what makes a strong debate program
                  </Link>
                  .
                </>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={localizeHref("/book")}
                className="inline-block px-10 py-4 bg-gold-400 text-navy-900 font-semibold text-lg rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t("classesPage.bookCta")}
              </Link>
              <Link
                href={localizeHref("/register")}
                className="inline-block px-10 py-4 bg-white text-navy-800 font-semibold text-lg rounded-lg hover:bg-warm-50 transition-all duration-200"
              >
                {t("nav.register")}
              </Link>
              <Link
                href={localizeHref("/compare")}
                className="inline-block px-10 py-4 border border-white text-white font-semibold text-lg rounded-lg hover:bg-white hover:text-navy-800 transition-all duration-200"
              >
                {t("classesPage.compareCta")}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
