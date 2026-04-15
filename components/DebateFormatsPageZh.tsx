import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "辩论一共有多少种赛制？",
    answer:
      "学生最常遇到的辩论赛制包括：加拿大全国辩论赛制（CNDF）、British Parliamentary（BP）、World Schools、Cross-Examination（CX / Policy）、Lincoln-Douglas、Public Forum 以及 Junior World Schools。每种赛制的发言人数、时间限制和评分标准都不同。DSDC 主要教授加拿大学生在真实比赛中最常遇到的四种赛制。",
  },
  {
    question: "辩论的「四个 C」是什么？",
    answer:
      "常说的四个 C 指的是：Clarity（表达清晰）、Consistency（前后一致）、Credibility（论据可信）和 Contention（立场明确）。DSDC 的教练会在任何赛制之前先把这四项作为基础打好。",
  },
  {
    question: "孩子应该从哪种赛制开始学？",
    answer:
      "大多数加拿大学生会从 CNDF 开始，因为它是加拿大中学比赛和 Canadian Nationals 的标准赛制。年纪较小或比较内向的孩子可以先学公共演讲再进入正式辩论。国际路线或准备 World Schools 的学生可以直接从 World Schools 入手。",
  },
  {
    question: "DSDC 教所有这些赛制吗？",
    answer:
      "是的。DSDC 教授 CNDF、British Parliamentary、World Schools 和 Cross-Examination。学生会被分到和自己目标最匹配的赛制——例如 Canadian Nationals、OSDU 比赛、国际比赛或 Junior WSDC。",
  },
  {
    question: "学会一个新赛制需要多长时间？",
    answer:
      "对于已经有辩论基础的学生，一般 1-2 周就能掌握一个新赛制的基本规则。但要在新赛制里真正打得好，通常需要一整个学期的系统训练，因为发言角色、时间限制和评分逻辑都需要反复练习才能内化。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "辩论赛制", path: "/zh/debate-formats" },
]);

const formats = [
  {
    name: "加拿大全国辩论赛制（CNDF）",
    href: "/blog/cndf-debate-format-explained",
    summary:
      "加拿大中学比赛和 Canadian Nationals 资格赛的标准赛制。两支两人队伍就一个议题进行辩论，包含建构发言、反驳和 Points of Information。",
    bestFor: "目标是省级比赛或 CSDF Nationals 的加拿大学生。",
  },
  {
    name: "British Parliamentary（BP）",
    href: "/zh/blog/british-parliamentary-debate-guide",
    summary:
      "四支两人队伍在严格的时间限制下就一个议题辩论。BP 鼓励快速反应、论点延展和四张发言位之间的战略定位。世界大学辩论锦标赛的标准赛制。",
    bestFor: "年纪较大、准备进入大学辩论圈的学生。BP 是全球大学辩论的主要赛制。",
  },
  {
    name: "World Schools Debate",
    href: "/blog/world-schools-debate-format",
    summary:
      "World Schools Debating Championships 以及许多国际中学比赛使用的混合赛制。每队三位发言人，议题可能是预先公布的也可能是即兴的，对团队配合和表达风格要求很高。",
    bestFor: "准备 World Schools、国际比赛或 Junior WSDC 的学生。",
  },
  {
    name: "Cross-Examination（CX / Policy）",
    href: "/blog/cross-examination-debate-guide",
    summary:
      "两支两人队伍就一个决议进行辩论，发言之间有直接的质询环节。比其他赛制更强调证据、研究和政策分析。北美比赛圈常见。",
    bestFor: "喜欢做研究、基于证据进行论证、对政策话题感兴趣的学生。",
  },
  {
    name: "Junior World Schools（Junior WSDC）",
    href: "/blog/junior-wsdc-explained",
    summary:
      "World Schools 的低龄版本，为初中和小学高年级学生设计。核心结构相同，但对年龄匹配的评分标准和期望做了调整。",
    bestFor: "想要国际化赛制、但还没有准备好直接进入 World Schools 的初中学生。",
  },
];

const comparisonRows = [
  { format: "CNDF", speakers: "每队 2 人", time: "约 8-10 分钟发言", motions: "议题提前公布", prep: "完整准备" },
  { format: "British Parliamentary", speakers: "每队 2 人，共 4 队", time: "7 分钟发言", motions: "15 分钟即兴准备", prep: "轻量准备" },
  { format: "World Schools", speakers: "每队 3 人", time: "8 分钟发言", motions: "预备题与即兴题混合", prep: "两者都有" },
  { format: "Cross-Examination", speakers: "每队 2 人", time: "更长发言 + 质询", motions: "全年大题目", prep: "重证据准备" },
  { format: "Junior WSDC", speakers: "每队 3 人", time: "较短发言", motions: "混合", prep: "年龄适配准备" },
];

export default function DebateFormatsPageZh() {
  return (
    <>
      <JsonLd id="debate-formats-faq-schema-zh" data={faqSchema} />
      <JsonLd id="debate-formats-breadcrumb-schema-zh" data={breadcrumbSchema} />

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
            赛制总览
          </p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            写给加拿大学生的辩论赛制指南
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            一份实用的赛制总览，介绍 DSDC 教授的主要赛制：CNDF、British Parliamentary、World Schools、Cross-Examination 以及 Junior WSDC。先选一个起点，再进入对应的详细指南深入了解。
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
              查看 DSDC 课程
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="赛制核心信息"
        facts={[
          { label: "涵盖赛制", value: "CNDF、British Parliamentary、World Schools、Cross-Examination、Junior WSDC" },
          { label: "加拿大标准赛制", value: "CNDF——大多数加拿大中学比赛的主流赛制" },
          { label: "大学标准赛制", value: "British Parliamentary——世界大学辩论锦标赛的使用赛制" },
          { label: "国际标准赛制", value: "World Schools——World Schools Debating Championships 使用的赛制" },
          { label: "初学者推荐", value: "先学 CNDF 或公共演讲" },
          { label: "DSDC 教学", value: "全部主要赛制均由加拿大国家辩论队成员亲授" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么赛制很重要
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              辩论赛制就是决定每一场比赛怎么进行的规则：每队几个人、每次发言多久、议题是预备题还是即兴题、以及评委真正重视的是什么。两个表达能力完全相同的学生，在不同赛制里的表现可能完全不一样，因为每种赛制对策略的要求不同。
            </p>
            <p>
              选择合适的赛制，其实不是在问「哪一个最好」，而是要匹配孩子的目标。目标是 CSDF Nationals 的加拿大学生应该从 CNDF 开始。有志于世界大学辩论锦标赛的高中生应该学 British Parliamentary。想走国际路线的初中生可以从 Junior WSDC 入手。
            </p>
            <p>
              下面是 DSDC 最常教授的五种赛制。每一种都链接到一份完整的指南，你可以深入了解规则、评分和策略。如果想要专业建议，最快的方法就是预约一次免费咨询。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            DSDC 教授的五种辩论赛制
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {formats.map((format) => (
              <article
                key={format.name}
                className="flex flex-col rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white font-serif">{format.name}</h3>
                <p className="mb-4 flex-1 leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{format.summary}</p>
                <p className="mb-4 text-sm italic text-navy-700 dark:text-gold-300 font-sans">
                  适合：{format.bestFor}
                </p>
                <Link
                  href={format.href}
                  className="inline-flex text-sm font-semibold text-gold-600 underline underline-offset-4 transition-colors hover:text-gold-500"
                >
                  查看完整指南
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            五种赛制快速对比
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            把加拿大学生最常遇到的赛制放在一起对比。可以用这张表快速决定孩子从哪里开始。
          </p>
          <div className="overflow-x-auto rounded-2xl border border-warm-200 bg-warm-50 dark:border-navy-700 dark:bg-navy-800">
            <table className="min-w-full divide-y divide-warm-200 dark:divide-navy-700 text-left text-sm">
              <thead className="bg-navy-800 text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">赛制</th>
                  <th scope="col" className="px-4 py-3 font-semibold">发言人数</th>
                  <th scope="col" className="px-4 py-3 font-semibold">发言时长</th>
                  <th scope="col" className="px-4 py-3 font-semibold">议题类型</th>
                  <th scope="col" className="px-4 py-3 font-semibold">准备方式</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200 dark:divide-navy-700">
                {comparisonRows.map((row) => (
                  <tr key={row.format}>
                    <td className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">{row.format}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.speakers}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.time}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.motions}</td>
                    <td className="px-4 py-3 text-charcoal/75 dark:text-navy-200">{row.prep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            如何选择起点赛制
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              <strong>完全零基础、加拿大学生：</strong>从 CNDF 开始。这是加拿大学校和省级比赛最常见的赛制。先学 CNDF 的学生能顺利进入省级选拔和 CSDF Nationals。如果孩子年纪很小或性格比较内向，公共演讲会是一个更温和的入门方式。
            </p>
            <p>
              <strong>准备进入 UBC、U of T、McGill 或 SFU 大学辩论圈的学生：</strong>学 British Parliamentary。几乎所有大学辩论社都在打 BP，所以高中阶段就训练 BP 的学生进入大学辩论圈会非常顺畅。
            </p>
            <p>
              <strong>想走国际路线或准备 WSDC 的学生：</strong>训练 World Schools 赛制。它是 World Schools Debating Championships 和许多国际中学比赛的主流赛制。Junior WSDC 是低龄版本，适合年纪较小的学生。
            </p>
            <p>
              <strong>喜欢研究、看重证据的学生：</strong>可以考虑 Cross-Examination（政策辩论风格）。这种赛制更看重扎实的准备和事实论证，而不只是即兴发言能力。
            </p>
            <p>
              不确定该选哪一种？{" "}
              <Link href="/zh/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                预约免费咨询
              </Link>
              ，我们会根据孩子的年级、目标和性格推荐最合适的起点赛制。
            </p>
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
            准备好在真实赛制中开始训练了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            DSDC 教授本页列出的所有赛制。预约免费咨询，我们会根据孩子的年级和目标推荐最合适的起点班级。
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
