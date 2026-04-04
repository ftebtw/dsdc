import Image from "next/image";
import Link from "next/link";
import KeyFactsBox from "@/components/KeyFactsBox";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "DSDC 适合哪个年级的学生？",
    answer:
      "我们主要服务 4 至 12 年级学生，从完全零基础到高水平竞赛训练都能找到合适班级。",
  },
  {
    question: "孩子没有辩论经验也可以吗？",
    answer:
      "可以。很多学生都是从零开始，我们也有非常适合初学者和较害羞学生的课程路径。",
  },
  {
    question: "线上辩论课具体是怎么上的？",
    answer:
      "所有课程通过 Zoom 直播进行，包含讲解、实战练习、分组讨论、当堂发言和课后书面反馈。",
  },
  {
    question: "你们和一般线上 enrichment 项目有什么不同？",
    answer:
      "DSDC 更强调持续训练、分层课程和真实反馈，不是单纯讲授知识，而是帮助学生每周把表达和思考能力练出来。",
  },
  {
    question: "报名前可以先了解适合哪个班吗？",
    answer:
      "可以。建议先预约免费咨询，我们会根据孩子的年级、基础和目标做推荐。",
  },
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "在线辩论课程（4-12年级）",
  description: "DSDC 提供适合 4 至 12 年级学生的在线辩论课程，包括入门、进阶、竞赛与公共演讲路径。",
  provider: {
    "@type": "Organization",
    name: "Debate & Speech Development Community (DSDC)",
    sameAs: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/zh/online-debate-classes",
};

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "在线辩论课程", path: "/zh/online-debate-classes" },
]);

export default function OnlineDebateClassesPageZh() {
  return (
    <>
      <JsonLd id="online-course-schema-zh" data={courseSchema} />
      <JsonLd id="online-faq-schema-zh" data={faqSchema} />
      <JsonLd id="online-breadcrumb-schema-zh" data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/photos/wsc-group-2.jpg"
            alt="Students participating in an online debate class"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-navy-900/55" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            面向 4-12 年级学生的在线辩论课程
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            从零基础到高水平竞赛训练，DSDC 通过 Zoom 直播帮助学生建立表达、自信与高阶思辨能力。
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/zh/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              预约免费咨询
            </Link>
            <Link
              href="/zh/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              查看课程安排
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="课程重点信息"
        facts={[
          { label: "创立时间", value: "2017 年，温哥华" },
          { label: "授课形式", value: "Zoom 直播小班课" },
          { label: "班级规模", value: "通常 8-12 人" },
          { label: "适合年龄", value: "4 至 12 年级及以上" },
          { label: "课程价格", value: "$30-50 CAD/小时（小班课）" },
          { label: "教授赛制", value: "CNDF、BP、World Schools、Cross-Examination" },
          { label: "代表成绩", value: "自 2020 年起 WSC 保持 100% 晋级率" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么在线辩论课真的有效
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              对很多家庭来说，线上课程最大的优势不是“方便”这么简单，而是更容易持续。真正让孩子进步的，往往不是偶尔上一节好课，而是能不能每周稳定参加、持续练习、反复获得反馈。
            </p>
            <p>
              在线课程还让学生接触到更广泛的同龄人和更强的教练资源。孩子不再局限于当地能找到的少数项目，而是可以跟来自不同地区、不同背景的学生一起讨论、更快提升思考深度和表达广度。
            </p>
            <p>
              更重要的是，DSDC 的线上课并不是单向讲座。课堂包含 live practice、breakout room、小组讨论、即兴发言和教练点评，学生必须真正开口、真正思考、真正做练习。
            </p>
          </div>
          <p className="mt-8 text-base text-charcoal/70 dark:text-navy-300 font-sans">
            如果孩子刚入门，可以先看{" "}
            <Link href="/debate-classes-for-beginners" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              入门辩论课程
            </Link>
            ；如果你想看更地区化的信息，也可以浏览{" "}
            <Link href="/zh/debate-classes-vancouver" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              温哥华页面
            </Link>
            、{" "}
            <Link href="/zh/debate-classes-toronto" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              多伦多页面
            </Link>
            与{" "}
            <Link href="/debate-classes-canada" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              加拿大页面
            </Link>
            。
          </p>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            在线课程通常如何运作
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              ["第一步：预约咨询", "先了解孩子的年级、经验、自信程度和学习目标。"],
              ["第二步：获得分班建议", "我们会推荐合适的班级路径，而不是让家长自己盲选。"],
              ["第三步：开始直播学习", "孩子加入 Zoom 小班课，通过实战练习和反馈逐步进步。"],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-warm-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{title}</h3>
                <p className="leading-relaxed text-charcoal/70 dark:text-navy-300 font-sans">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            大多数课程为每周一次 2 小时，包含热身、讲解、练习赛、即时点评和课后反馈。学生也会收到简短作业和必要时的阶段性总结，让成长是连续发生的，而不是零散的。
          </p>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            适合不同阶段学生的在线课程
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              ["Novice（4-6年级）", "帮助较年轻学生建立表达自信、基本结构和入门辩论习惯。"],
              ["Junior（7-9年级）", "让学生在更复杂议题中练习组织论点、回应对方和更快思考。"],
              ["Senior（10-12年级）", "面向已有一定基础的学生，训练更成熟的比赛节奏与高阶论证。"],
              ["Advanced Competitive", "高强度竞技训练，适合希望认真参加比赛并冲击更高成绩的学生。"],
              ["Public Speaking", "先提升台风、声音控制、结构表达，再逐步进入正式辩论。"],
              ["World Scholar's Cup", "提供更综合的学术与竞赛训练路径，兼顾 debate、writing 与团队项目。"],
            ].map(([title, text]) => (
              <article
                key={title}
                className="flex flex-col rounded-2xl border border-warm-200 bg-warm-50 p-6 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{title}</h3>
                <p className="flex-1 leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{text}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/zh/classes"
                    className="rounded-md border border-warm-300 px-4 py-2 text-sm font-medium text-navy-800 transition-colors hover:bg-warm-100 dark:border-navy-600 dark:text-navy-100 dark:hover:bg-navy-700"
                  >
                    查看课程
                  </Link>
                  <Link
                    href="/zh/book"
                    className="rounded-md bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
                  >
                    预约咨询
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            我们教授哪些辩论与演讲能力
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-lg text-charcoal/75 dark:text-navy-200 font-sans">
            DSDC 不只是在教“怎么说话”，而是在训练孩子如何思考、如何组织、如何回应和如何说服。
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["World Schools", "训练团队协作、准备能力和国际型议题表达。"],
              ["British Parliamentary", "提升快速分析、比较论证和高阶比赛策略。"],
              ["CNDF", "强化清晰结构、证据使用与对点回应。"],
              ["Cross-Examination", "帮助学生在直接交锋中练习质询、反驳和防守。"],
              ["Impromptu & Persuasive Speaking", "提升即兴反应、组织能力和面对听众的说服力。"],
              ["Interpretive Speaking", "强化表现力、节奏感与舞台表达。"],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-xl border border-warm-200 bg-white p-5 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 dark:text-white">{title}</h3>
                <p className="leading-relaxed text-charcoal/70 dark:text-navy-300 font-sans">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            由高水平辩手与教练团队授课
          </h2>
          <div className="space-y-5 text-left text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 md:text-center font-sans">
            <p>
              DSDC 的教练来自顶尖大学和高水平比赛背景，包括加拿大国家队、世界大学辩论锦标赛以及各类北美、国际赛事。我们非常重视每个学生的个体差异，所以反馈不是泛泛而谈，而是尽量具体到下一步怎么做。
            </p>
            <p>
              对很多家庭来说，真正的差别不只是“教练厉不厉害”，而是教练是否能把高水平经验转化成孩子听得懂、做得到的训练路径。DSDC 的目标就是把这件事做好。
            </p>
          </div>
          <Link
            href="/zh/team"
            className="mt-8 inline-block rounded-lg bg-navy-800 px-8 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-navy-700"
          >
            查看教练团队
          </Link>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            常见问题
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 transition-colors hover:bg-warm-50 dark:hover:bg-navy-700/50 sm:p-5">
                  <span className="pr-4 text-sm font-semibold text-navy-800 dark:text-navy-100 sm:text-base font-sans">
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
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-800 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">准备开始了吗？</h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/85 font-sans">
            已有超过 1,000 名学生通过 DSDC 提升了表达、自信与批判性思维。你可以先看{" "}
            <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              课程
            </Link>
            、{" "}
            <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              价格
            </Link>
            ，再预约免费咨询。
          </p>
          <div className="mb-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/zh/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              预约免费咨询
            </Link>
            <Link
              href="/zh/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              查看课程
            </Link>
          </div>
          <a href="mailto:education@dsdc.ca" className="text-gold-300 transition-colors hover:text-gold-200">
            education@dsdc.ca
          </a>
        </div>
      </section>
    </>
  );
}
