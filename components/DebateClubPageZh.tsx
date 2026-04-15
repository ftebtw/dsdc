import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "什么是辩论俱乐部？",
    answer:
      "辩论俱乐部是一个结构化的学生社群，成员定期一起练习辩论、学习表达技巧并为比赛做准备。DSDC 的在线辩论俱乐部通过 Zoom 开展，加拿大各地的学生都可以参加每周的固定课程。",
  },
  {
    question: "在线辩论俱乐部是怎么上课的？",
    answer:
      "学生按课表登录 Zoom，进入一个 8-12 人的小组，整节课都在做真正的辩论训练：建构论点、发言、反驳、实战对抗，课后会有书面反馈。不用接送、不用通勤，教学质量和线下俱乐部一样甚至更好。",
  },
  {
    question: "DSDC 的辩论俱乐部比就近的线下俱乐部更好吗？",
    answer:
      "这要看你住在哪里。如果附近真的有一个稳定、强大的线下俱乐部当然很好。但大多数加拿大家庭最近的选择要么规模很小、要么频率不稳定、要么已经满员。DSDC 的在线俱乐部解决了地理问题，提供每周稳定开课、结构化的教学。",
  },
  {
    question: "DSDC 辩论俱乐部适合哪些年龄的学生？",
    answer:
      "欢迎 4-12 年级的学生。Novice（4-6 年级）学习基础知识。Junior 和 Senior 进入竞赛型赛制。我们会根据孩子的年龄、自信程度和经验把他们分到最合适的小组。",
  },
  {
    question: "俱乐部多久开一次课？",
    answer:
      "大多数 DSDC 辩论俱乐部班级每周开一次课，每次 1 到 1.5 小时。秋冬赛季会额外安排比赛准备课程。",
  },
  {
    question: "DSDC 辩论俱乐部的收费是多少？",
    answer:
      "DSDC 的小组辩论俱乐部课程收费是每小时 30-50 加元，比大多数线下辩论老师便宜很多。所有价格都在价格页面公开透明，报名前就能看到。",
  },
  {
    question: "俱乐部会教哪些赛制？",
    answer:
      "CNDF（加拿大全国辩论赛制）、British Parliamentary、World Schools 以及 Cross-Examination。学生根据年龄和想参加的比赛学习最适合的赛制。",
  },
  {
    question: "俱乐部成员需要参加比赛吗？",
    answer:
      "如果学生自己想参加，当然可以。很多 DSDC 俱乐部成员会准备加拿大全国比赛、BC 与安省省级比赛以及国际赛事。不想比赛的学生也完全没有压力，可以专注于自信、表达与学术成长。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "辩论俱乐部", path: "/zh/debate-club" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "DSDC 在线辩论俱乐部",
  description:
    "面向加拿大 4-12 年级学生的在线辩论俱乐部。每周 Zoom 直播练习，小组教学，比赛准备，全国同龄伙伴群。",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/debate-club",
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT1H30M",
  },
  offers: {
    "@type": "Offer",
    price: "30",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    url: "https://dsdc.ca/zh/pricing",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    audienceType: "Students in Grades 4-12",
  },
};

const clubTiers = [
  {
    tier: "Novice 班（4-6 年级）",
    text: "俱乐部的起步阶段。学生学习如何组织论点、自信发言、倾听对方观点并做出礼貌回应。适合年纪较小或完全零基础的孩子，无需任何经验。",
  },
  {
    tier: "Junior 班（7-9 年级）",
    text: "适合进入竞赛型赛制的初中学生。成员会进行实战练习、研究真实比赛题目，有兴趣的话可以开始参加校级和省级比赛。",
  },
  {
    tier: "Senior 班（10-12 年级）",
    text: "高中成员接触 CNDF、British Parliamentary、World Schools 和 Cross-Examination 等赛制。很多成员会在这一阶段开始备战全国比赛和大学辩论队。",
  },
  {
    tier: "Advanced 竞赛组",
    text: "邀请制，面向在比赛中已经取得成绩、并希望接受更高水平训练的成员。小组更小、训练更难，直接为全国和国际比赛做准备。",
  },
];

const clubCycle = [
  {
    phase: "第一学期：基础与论点建构",
    text: "每个学年从结构化教学开始，重点是论点建构、建构发言和基础反驳。学生在小组中练习，每周都有充分的发言时间。",
  },
  {
    phase: "第二学期：赛季",
    text: "赛季期间，课堂练习会模拟真实比赛环境。准备加拿大全国比赛或安省 OSDU 的成员会得到额外的训练和战术讲解。",
  },
  {
    phase: "第三学期：展示与高阶赛制",
    text: "学年的最后一个学期会学习更高阶的赛制——British Parliamentary、World Schools——并以一场 DSDC 内部对抗赛作为展示。学生结束时能看到明显的进步和真实的比赛经验。",
  },
];

const clubBenefits = [
  {
    title: "每周固定节奏",
    text: "俱乐部只有稳定开课才能真正帮到学生。DSDC 每个班级都有固定的周课表——不是零散的 drop-in——成员能养成真正的学习习惯。",
  },
  {
    title: "教练直接教学",
    text: "每节课都由教练带领，不是学生互相带练。我们的教练来自加拿大国家辩论队、UBC、SFU 以及国际大学辩论圈。",
  },
  {
    title: "全国同龄伙伴群",
    text: "成员会和来自温哥华、多伦多、卡尔加里、渥太华等地的同龄人一起练习。伙伴群越大，练习对手越强，学生接触到的视角也越丰富。",
  },
  {
    title: "书面反馈",
    text: "每位成员每节课后都会收到个性化的书面反馈。学生和家长都能清楚地看到进步。",
  },
  {
    title: "比赛支持",
    text: "想参加比赛的学生会得到选赛建议、题目训练和行程协助。不想比赛的学生也不会被强行推上赛场。",
  },
  {
    title: "价格透明",
    text: "小组班级每小时 30-50 加元，所有价格都在官网公开，没有隐藏的入会费或套餐绑定。",
  },
];

export default function DebateClubPageZh() {
  return (
    <>
      <JsonLd id="debate-club-course-schema-zh" data={courseSchema} />
      <JsonLd id="debate-club-faq-schema-zh" data={faqSchema} />
      <JsonLd id="debate-club-breadcrumb-schema-zh" data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-gold-300">
            线上辩论俱乐部
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            加拿大线上辩论俱乐部（4-12 年级）
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            每周通过 Zoom 开课的在线辩论俱乐部。小班教学，加拿大国家辩论队教练亲授，全国同龄伙伴群，比家门口的线下俱乐部更稳定、更结构化。
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
              查看课程级别
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="辩论俱乐部核心信息"
        facts={[
          { label: "授课形式", value: "Zoom 直播小班课" },
          { label: "适合年级", value: "4-12 年级" },
          { label: "班级规模", value: "通常 8-12 人" },
          { label: "上课频率", value: "每周一次，1-1.5 小时" },
          { label: "教练来源", value: "加拿大国家辩论队成员及顶尖大学辩手" },
          { label: "教授赛制", value: "CNDF、British Parliamentary、World Schools、Cross-Examination" },
          { label: "收费", value: "小组课 30-50 加元/小时" },
          { label: "下一步", value: "预约 15 分钟免费咨询" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么越来越多的家庭选择线上辩论俱乐部
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              很多家长在网上搜索&quot;附近的辩论俱乐部&quot;时会遇到同样的问题：最近的俱乐部要么规模很小，要么开课不稳定，要么由没有教学经验的志愿者带领。在大城市，好的俱乐部往往已经满员。在小城市和郊区，甚至根本没有真正的辩论俱乐部。
            </p>
            <p>
              线上辩论俱乐部同时解决了这两个问题。DSDC 成员从家登录 Zoom，加入一个 8 到 12 人的全国性小组，整节课都在做真正的发言练习。每节课里的发言时间通常比线下俱乐部还多，而且因为俱乐部由全职辩论教练运营，教学质量非常稳定。
            </p>
            <p>
              这种形式还会帮助学生建立全国性的同龄伙伴群。一个渥太华的学生会和温哥华、卡尔加里、多伦多和 Halifax 的学生一起练习。更强的伙伴群意味着更高质量的练习对手、更多样的视角，以及一个不会因为学年结束就散开的长期社群。
            </p>
            <p>
              如果想更详细了解 DSDC 的课程结构，可以查看{" "}
              <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                课程页面
              </Link>{" "}
              中列出的所有级别，价格也在{" "}
              <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                价格页面
              </Link>{" "}
              完全公开。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            俱乐部分级
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            成员会根据年级、经验和目标被分到最合适的俱乐部组别。
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {clubTiers.map((tier) => (
              <article
                key={tier.tier}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{tier.tier}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{tier.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            按学期推进的比赛准备节奏
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            DSDC 辩论俱乐部按三学期节奏运作，成员能持续积累，而不是每隔几周就从零开始。
          </p>
          <div className="space-y-5">
            {clubCycle.map((phase, index) => (
              <article
                key={phase.phase}
                className="flex flex-col gap-2 rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800 md:flex-row md:items-start md:gap-6"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-48">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-900">
                    {index + 1}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                    第 {index + 1} 学期
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-navy-800 dark:text-white font-serif">{phase.phase}</h3>
                  <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{phase.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            DSDC 俱乐部成员能得到什么
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clubBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 dark:text-white">{benefit.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
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
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
            准备好加入加拿大线上辩论俱乐部了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            预约 15 分钟免费咨询，我们会根据孩子的年级、自信程度和目标推荐最适合的俱乐部组别。
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
              比较所有课程
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
