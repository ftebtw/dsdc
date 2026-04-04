import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "DSDC 在温哥华吗？还是纯线上机构？",
    answer:
      "DSDC 于 2017 年创立于温哥华，目前课程以 Zoom 直播形式进行，所以温哥华和大温家庭可以在家上到高质量辩论课，不受通勤限制。",
  },
  {
    question: "孩子在温哥华能学到哪些辩论赛制？",
    answer:
      "学生会根据年级和程度接触 CNDF、British Parliamentary、World Schools、Cross-Examination，以及公共演讲和演讲比赛相关训练。",
  },
  {
    question: "如果孩子学校没有 debate club，也适合报名吗？",
    answer:
      "非常适合。很多家庭就是因为学校没有辩论社、或者学校训练不够系统，才选择 DSDC 作为主要训练渠道。",
  },
  {
    question: "上课前需要准备什么设备？",
    answer:
      "一台可以开摄像头和麦克风的电脑、稳定网络，以及安静的发言环境即可。课程内容、练习结构和反馈都由 DSDC 提供。",
  },
  {
    question: "温哥华家庭通常怎样开始？",
    answer:
      "最常见的流程是先预约免费咨询，再根据孩子的年级、基础和目标推荐最合适的班级。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "温哥华辩论课程", path: "/zh/debate-classes-vancouver" },
]);

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DSDC - Debate & Speech Development Community",
  description: "面向温哥华与大温学生的在线辩论与公共演讲课程。",
  url: "https://dsdc.ca/zh/debate-classes-vancouver",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  email: "education@dsdc.ca",
  areaServed: [
    "Vancouver",
    "Burnaby",
    "Richmond",
    "Surrey",
    "Coquitlam",
    "North Vancouver",
    "West Vancouver",
    "New Westminster",
    "Langley",
    "Delta",
  ],
};

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "温哥华儿童辩论课程",
      description: "面向温哥华学生的在线辩论课程，帮助孩子提升逻辑表达、论证和反驳能力。",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
    {
      "@type": "Course",
      position: 2,
      name: "温哥华公共演讲课程",
      description: "帮助孩子提升表达自信、演讲结构、声音控制和课堂展示能力。",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
    {
      "@type": "Course",
      position: 3,
      name: "温哥华世界学者杯备赛",
      description: "面向 WSC 学生的系统备赛训练，自 2020 年以来保持 100% 晋级率。",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
  ],
};

const testimonials = [
  {
    name: "Angela M.",
    role: "8年级学生",
    quote: "自从加入 DSDC 以来，我的自信和批判性思维都有非常明显的进步。",
  },
  {
    name: "Ryland C.",
    role: "9年级学生",
    quote: "教练的反馈很具体，也真的会认真设计每节课，让学生不断成长。",
  },
  {
    name: "Daniel W.",
    role: "9年级学生",
    quote: "DSDC 的学习环境非常好，老师真心支持每一个学生，也很有热情。",
  },
];

export default function VancouverLandingPageZh() {
  return (
    <>
      <JsonLd id="vancouver-faq-schema-zh" data={faqSchema} />
      <JsonLd id="vancouver-local-business-schema-zh" data={localBusinessSchema} />
      <JsonLd id="vancouver-course-schema-zh" data={courseSchema} />
      <JsonLd id="vancouver-breadcrumb-schema-zh" data={breadcrumbSchema} />

      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            温哥华家庭可在线参加的辩论课程
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            来自温哥华的 DSDC，为大温地区学生提供直播辩论、公共演讲与竞赛训练课程。
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
              查看全部课程
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
          { label: "课程价格", value: "小班课约 $30-50 CAD/小时" },
          { label: "教授赛制", value: "CNDF、BP、World Schools、Cross-Examination" },
          { label: "代表成绩", value: "自 2020 年起 WSC 保持 100% 晋级率" },
          { label: "覆盖地区", value: "温哥华、本拿比、列治文、素里、高贵林、北温、西温等" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么温哥华家庭会选择 DSDC
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              DSDC 创立于温哥华，所以我们对 BC 的辩论生态非常熟悉。很多家庭来找我们，并不只是想让孩子“多说一点”，而是希望孩子真正学会如何思考、如何组织观点、如何在课堂与比赛中更有说服力地表达。
            </p>
            <p>
              对大温家庭来说，线上模式最大的优势之一是长期可持续。孩子不用把大量时间花在跨区通勤上，但依然能得到直播教学、小班实战、分组讨论和课后反馈。对于同时兼顾学校、音乐、体育和家庭安排的学生来说，这种稳定性往往比形式上的“线下”更重要。
            </p>
            <p>
              更重要的是，DSDC 提供的是一条完整成长路径。孩子可以从公共演讲或入门辩论开始，逐步进入更系统的比赛训练，再发展到更高水平的竞赛课程，而不是每到一个阶段就重新寻找新的机构。
            </p>
            <p>
              如果你正在比较选择，可以先看看我们的{" "}
              <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                课程价格
              </Link>
              、{" "}
              <Link href="/zh/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                教练团队
              </Link>
              ，再阅读{" "}
              <Link
                href="/blog/best-debate-programs-vancouver"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                如何选择优质辩论项目
              </Link>
              这篇文章，通常就会更容易判断孩子适合哪一条路径。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            温哥华学生在 DSDC 会接触哪些赛制
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[
              ["CNDF（加拿大全国辩论赛制）", "CNDF 是加拿大中学辩论中最重要的赛制之一，重视清晰结构、证据运用和对对方观点的正面回应。"],
              ["British Parliamentary", "BP 更强调快速分析、比较论证和策略选择，适合希望提升高阶竞赛能力的学生。"],
              ["World Schools", "World Schools 同时考验团队合作、准备能力与即兴表达，是国际赛事中非常常见的重要赛制。"],
              ["Cross-Examination", "Cross-Examination 强调直接交锋、质询与防守，非常适合培养研究能力和高强度反驳技巧。"],
              ["公共演讲与 Speech 训练", "除了正式辩论，我们也帮助学生训练 impromptu、persuasive 和 interpretive speaking，打好更全面的表达基础。"],
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            温哥华家庭常选的课程路径
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              ["Novice（4-6年级）", "面向零基础或较害羞的孩子，重点是建立表达自信、观点结构和基本反驳能力。"],
              ["Junior（7-9年级）", "开始处理更复杂议题，提升分析深度、应变速度和更完整的论证表达。"],
              ["Senior（10-12年级）", "适合有一定基础的学生，训练更成熟的战略判断、比赛节奏和高阶论证。"],
              ["Advanced Competitive", "高强度竞技训练，适合目标明确、希望冲击更高水平比赛成绩的学生。"],
              ["Public Speaking", "适合想先提升台风、结构表达和课堂展示能力，再逐步进入辩论的学生。"],
              ["World Scholar's Cup", "系统备赛课程，帮助学生同时准备 debate、writing 和团队类项目。"],
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
                    查看级别
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
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            家长报名之前需要知道什么
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["每周节奏清晰", "大多数课程以每周一次或两次、每次两小时的方式进行，既能保证训练密度，也比较适合学生长期坚持。"],
              ["设备要求简单", "孩子只需要电脑、摄像头、麦克风和稳定网络。课堂会用到直播讲解、分组房间、共享文档和实战练习。"],
              ["作业不重但有针对性", "课后任务通常是简短研究、speech outline 或 case 准备，目的是把课堂内容真正转化成能力。"],
              ["分班重视匹配度", "我们会根据年级、经验和表达自信来推荐班级，而不是让所有孩子都从同一个起点开始。"],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-warm-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-lg font-bold text-navy-800 dark:text-white">{title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            我们服务的大温区域
          </h2>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "温哥华市区与西区",
              "东温与南温",
              "本拿比与新西敏",
              "列治文",
              "素里与白石",
              "高贵林、满地宝与高贵林港",
              "北温与西温",
              "兰里、三角洲、枫树岭等周边地区",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-warm-200 bg-warm-50 px-4 py-4 text-sm font-medium text-navy-800 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100 sm:text-base"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            无论你在温哥华、本拿比、列治文、素里、高贵林、北温、西温、新西敏、兰里还是 BC 其他地区，只要能稳定上 Zoom，就能加入 DSDC。我们也同时服务全国各地家庭，如果你想看更广泛的区域信息，也可以阅读我们的{" "}
            <Link href="/debate-classes-canada" className="underline underline-offset-4 transition-colors hover:text-gold-500">
              加拿大辩论课程页面
            </Link>
            。
          </p>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            温哥华家庭的真实反馈
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <p className="text-base leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 border-t border-warm-200 pt-4 dark:border-navy-700">
                  <p className="font-bold text-navy-800 dark:text-white">{item.name}</p>
                  <p className="text-sm text-charcoal/55 dark:text-navy-300">{item.role}</p>
                </div>
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
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">准备开始孩子的温哥华辩论学习路径了吗？</h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            先看看{" "}
            <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              课程设置
            </Link>
            、{" "}
            <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              课程价格
            </Link>
            与{" "}
            <Link href="/zh/team" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              教练团队
            </Link>
            ，然后预约免费咨询。若你还在比较项目，也可以继续阅读我们的{" "}
            <Link
              href="/blog/best-debate-programs-vancouver"
              className="underline underline-offset-4 transition-colors hover:text-gold-300"
            >
              温哥华项目选择指南
            </Link>
            。
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
              查看全部课程
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
