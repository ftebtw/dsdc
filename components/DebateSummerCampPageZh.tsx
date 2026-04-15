import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "DSDC 的线上辩论夏令营是什么？",
    answer:
      "DSDC 线上辩论夏令营是在 7 月和 8 月开展的 Zoom 直播课程。学生在 1 到 2 周的集中班里学习辩论基础、实战对抗和表达技巧。节奏比我们平时的周课更紧凑，专为暑假设计。",
  },
  {
    question: "夏令营适合哪些年龄的学生？",
    answer:
      "欢迎 4-12 年级的学生。我们按年级分组：小学组（4-6 年级）、初中组（7-9 年级）、高中组（10-12 年级）。每个组的节奏和内容都根据年龄段做了调整。",
  },
  {
    question: "学生需要有辩论基础吗？",
    answer:
      "不需要。夏令营是很多孩子第一次接触辩论的起点。Novice 班是专门为完全零基础的学生设计的，教练也会根据每个学生的经验水平进行调整。",
  },
  {
    question: "夏令营收费是多少？",
    answer:
      "夏令营价格与我们平时的小组课相同，都是每小时 30-50 加元。1 周和 2 周的集中班会包含固定课时，具体价格请查看价格页面。",
  },
  {
    question: "夏令营什么时候开？",
    answer:
      "从 7 月初到 8 月底都有课。整个夏天会开多个班，家庭可以挑选和假期安排最匹配的那一周。",
  },
  {
    question: "夏令营和平时的辩论课有什么不同？",
    answer:
      "平时的课一周一次。夏令营更紧凑：学生一周上多次课，按更快的节奏完成课程，最后一天还会有一场展示辩论或完整的实战对抗。非常适合想在短时间里集中提升的学生，不需要一整年的投入。",
  },
  {
    question: "夏令营是全线上吗？",
    answer:
      "是的。所有课程都通过 Zoom 直播进行，和平时的课一样。加拿大国内以及海外学生都可以参加。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "辩论夏令营", path: "/zh/debate-summer-camp" },
]);

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "EducationEvent",
  name: "DSDC 线上辩论夏令营",
  description:
    "面向 4-12 年级学生的线上辩论夏令营。7 月和 8 月开展多个集中班，通过 Zoom 由加拿大国家辩论队教练亲授。",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  startDate: "2026-07-06",
  endDate: "2026-08-28",
  location: {
    "@type": "VirtualLocation",
    url: "https://dsdc.ca/debate-summer-camp",
  },
  organizer: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  offers: {
    "@type": "Offer",
    price: "300",
    priceCurrency: "CAD",
    availability: "https://schema.org/InStock",
    url: "https://dsdc.ca/zh/book",
  },
  image: "https://dsdc.ca/images/photos/wsc-group-2.jpg",
};

const weekSchedule = [
  {
    day: "第 1 天",
    text: "开营与热身发言游戏。讲解辩论结构。学员做一次简短的练习演讲，教练以此了解每位孩子的起点。",
  },
  {
    day: "第 2 天",
    text: "论点建构：如何把一个观点变成结构完整的论点（主张、理由、证据）。分组对抗练习和反馈。",
  },
  {
    day: "第 3 天",
    text: "反驳与回应。学员学习如何认真听对方发言，攻击对方的薄弱环节，并守住自己的立场。",
  },
  {
    day: "第 4 天",
    text: "迷你实战回合。压力较低的小组辩论，教练在课后会给每位学员书面反馈。",
  },
  {
    day: "第 5 天",
    text: "展示辩论。一周集训的收官完整回合，能看到学生和第 1 天明显的进步。课后给出最后反馈和下一步建议。",
  },
];

const ageGroups = [
  {
    title: "小学组（4-6 年级）",
    text: "针对年龄较小的学员。活泼的热身、简短的演讲、适合新手的辩论题目。非常适合第一次上台的孩子和偏内向、需要温和过渡的学生。",
  },
  {
    title: "初中组（7-9 年级）",
    text: "初中学生节奏更快。会学习真正的论点结构、反驳训练以及入门级比赛赛制。对于秋季打算加入学校辩论队的孩子是非常好的暑期准备。",
  },
  {
    title: "高中组（10-12 年级）",
    text: "高中学生会训练 CNDF 或 British Parliamentary 赛制，进行完整的实战回合，并为秋季比赛做直接准备。对于正在准备大学申请的学生也是高质量的暑期选项。",
  },
];

export default function DebateSummerCampPageZh() {
  return (
    <>
      <JsonLd id="debate-camp-event-schema-zh" data={eventSchema} />
      <JsonLd id="debate-camp-faq-schema-zh" data={faqSchema} />
      <JsonLd id="debate-camp-breadcrumb-schema-zh" data={breadcrumbSchema} />

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
            2026 夏季
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            面向 4-12 年级的线上辩论夏令营
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            通过 Zoom 直播的在线辩论夏令营。小班教学，经验丰富的教练，用一整周结构化的发言、辩论和反馈帮助孩子快速进步——不用跑遍全城。
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/zh/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              预约夏令营名额
            </Link>
            <Link
              href="/zh/classes"
              className="rounded-lg border-2 border-white px-8 py-3.5 text-center font-semibold text-white transition-all duration-200 hover:bg-white hover:text-navy-800"
            >
              查看所有课程
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="夏令营核心信息"
        facts={[
          { label: "时间", value: "2026 年 7 月和 8 月" },
          { label: "授课形式", value: "Zoom 直播在线课" },
          { label: "适合年级", value: "4-12 年级" },
          { label: "集训长度", value: "1 周和 2 周两种集中班" },
          { label: "每日时长", value: "每天约 1.5 小时" },
          { label: "班级规模", value: "通常 8-12 人" },
          { label: "收费", value: "小组课 30-50 加元/小时" },
          { label: "适合人群", value: "零基础学员和 DSDC 老学员都欢迎" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            一场好的线上辩论夏令营需要什么
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              一个真正有效的辩论夏令营，核心就是三件事：发言时间够不够、教练质量够不够、整周能不能形成学习节奏。DSDC 的在线夏令营就是围绕这三点设计的。学员按年级分组，每节课都有教练全程带领，每一天的内容都会建立在前一天的基础上，一周结束时家长能明显看到孩子的变化。
            </p>
            <p>
              采用线上形式本身就是优势，而不是妥协。家庭不用每天接送。温哥华的学生可以和多伦多、卡尔加里的同龄人一起上课。8 到 12 人的小班比大型线下夏令营给每个孩子的发言时间更多——因为每个人都在屏幕上，每一轮都要发言。
            </p>
            <p>
              家长在对比辩论夏令营和普通的暑期兴趣班时，关心的通常是孩子最后能带走什么：一项可衡量的表达能力、一种真实的辩论赛制、和在观众面前发言的自信。DSDC 的夏令营专注于这三个成果。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            DSDC 夏令营标准 5 天节奏
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            下面是标准 5 天 DSDC 辩论夏令营的流程。2 周集中班按照同样的节奏推进，但会加入更深入的训练、更正式的回合以及更完整的展示。
          </p>
          <div className="space-y-5">
            {weekSchedule.map((day, index) => (
              <article
                key={day.day}
                className="flex flex-col gap-2 rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800 md:flex-row md:items-start md:gap-6"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-32">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-900">
                    {index + 1}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                    {day.day}
                  </div>
                </div>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{day.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            年龄分组与夏令营方向
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ageGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{group.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{group.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            价格与报名
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              DSDC 夏令营沿用我们平时的小组课收费标准，每小时 30-50 加元。因为是集中班，家庭通常会一次性报名 1 周或 2 周的完整集训。具体价格取决于年龄组和课程长度，所有价格都会在报名前透明公开。
            </p>
            <p>
              每个班通常只收 8-12 名学员，保证每位学生都有发言时间和教练关注。热门周次（7 月中旬和 8 月初）名额通常会很快报满，所以早一点预约最有把握锁到心仪的组别。
            </p>
            <p>
              具体收费请查看{" "}
              <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                价格页面
              </Link>
              ，或者直接{" "}
              <Link href="/zh/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                预约免费咨询
              </Link>{" "}
              我们会告诉你哪些周次还有孩子对应年级的名额。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            辩论夏令营常见问题
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
            准备好给孩子报一个夏令营周次了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            尽早预约名额，避免心仪的周次满员。预约 15 分钟免费咨询，我们会帮你确认最适合孩子的年龄组和时间段。
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/zh/book"
              className="rounded-lg bg-gold-400 px-8 py-3.5 text-center font-semibold text-navy-900 shadow-md transition-all duration-200 hover:bg-gold-300"
            >
              预约夏令营名额
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
