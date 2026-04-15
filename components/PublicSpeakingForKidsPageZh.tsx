import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "演讲和辩论是同一回事吗？",
    answer:
      "不是。演讲课训练学生向听众呈现准备好的发言以及即兴发言。辩论在此之上增加了反驳、对抗以及实时论辩。演讲通常是起点；辩论是在演讲基础上建立起来的。",
  },
  {
    question: "演讲的「五个 C」是什么？",
    answer:
      "演讲的「五个 C」通常指：Clarity（清晰）、Confidence（自信）、Conciseness（简洁）、Connection（连接）以及 Credibility（可信度）。DSDC 的儿童演讲课程会有意识地把这五项能力贯穿整个学期，不只是口号，而是通过每周的演讲训练和反馈真正做出来。",
  },
  {
    question: "辩论对演讲有帮助吗？",
    answer:
      "有，而且帮助很大。辩论会迫使学生在压力下清晰表达、快速组织论点，并回应现场提问，这些都会显著提升演讲能力。很多 DSDC 学生是从演讲课开始的，等自信建立起来之后再进入辩论课。",
  },
  {
    question: "孩子几岁开始上演讲课比较合适？",
    answer:
      "最早可以从一年级开始，使用适合低龄孩子的教学方式；不过最常见的起步范围是 4-9 年级。具体时机因孩子而异。害羞、内敛、或者希望更自信表达的孩子，越早开始进步越明显。",
  },
  {
    question: "孩子在演讲课里具体会做什么？",
    answer:
      "学生会练习即兴发言、说服性演讲、演讲结构、声音表达和听众意识。课后还会收到书面反馈，这样他们清楚下一步该改进什么。",
  },
  {
    question: "如果孩子害怕当众发言，这门课合适吗？",
    answer:
      "合适。DSDC 的演讲课设计目标就是在一个温和、友好的环境里让孩子慢慢建立自信，而不是一上来就把他们推进高压表演现场。",
  },
  {
    question: "演讲课后来怎么和辩论衔接？",
    answer:
      "演讲课会在清晰、自信和结构上给孩子打下扎实的基础。很多家庭把演讲课当作通往辩论课的桥梁——等孩子准备好进入更直接的论辩与反驳训练时，就可以顺理成章地进入辩论课。",
  },
  {
    question: "课程费用是多少？怎么报名？",
    answer:
      "你可以先在网上查看我们的价格，然后预约一次免费咨询。我们会根据孩子的年龄、自信程度和目标为你推荐最合适的班级。",
  },
  {
    question: "在线演讲课真的有效吗？",
    answer:
      "在互动性强、反馈充分的前提下，在线演讲课是非常有效的。学生依然会进行实时发言、在小组里练习、得到直接指导，只不过免去了通勤和接送的麻烦。",
  },
];

const psValueProps = [
  {
    title: "Zoom 实时直播课",
    text: "每一节课都是实时互动的。学生需要真正发言、拿到反馈、与同伴和教练互动，而不是看预录的视频课。不用通勤，不用接送。",
  },
  {
    title: "小班授课",
    text: "班级人数控制在 8-12 人左右，保证每个孩子每节课都能真正开口。小班意味着更多个人发言时间、更多教练关注、更快的自信成长。",
  },
  {
    title: "经验丰富的教练",
    text: "DSDC 的教练来自加拿大国家辩论队、UBC、SFU 以及国际竞赛圈。他们不仅自己会讲，更懂得如何教孩子。",
  },
];

const psCohorts = [
  {
    cohort: "小学演讲班（1-6 年级）",
    window: "工作日晚上 太平洋时间 5:00-6:15 / 东部时间 8:00-9:15",
    text: "为低年级孩子设计的温和起点。重点是自信、声音清晰度、结构化的短篇演讲，以及在小组面前开口说话的舒适感。",
  },
  {
    cohort: "初中演讲班（7-9 年级）",
    window: "工作日晚上 太平洋时间 6:30-8:00",
    text: "为准备好处理更长篇演讲、说服性主题和认真对待即兴题目的初中学生开设。",
  },
  {
    cohort: "高中演讲班（10-12 年级）",
    window: "工作日晚上与周末",
    text: "适合希望在学校展示得更好、面试时更从容，并希望建立一项对奖学金申请与大学申请都有帮助的核心技能的高中学生。",
  },
  {
    cohort: "演讲 + 辩论衔接班",
    window: "滚动入学",
    text: "一个混合型班级，适合希望在一个学期内从演讲过渡到辩论的学生。对于还在纠结选哪个项目的家庭特别合适。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "儿童演讲课", path: "/zh/public-speaking-classes-for-kids" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "儿童演讲课",
  description:
    "DSDC 为儿童提供在线青少年演讲课程，聚焦自信、领导力、学术沟通能力以及清晰的表达技巧。",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/zh/public-speaking-classes-for-kids",
};

export default function PublicSpeakingForKidsPageZh() {
  return (
    <>
      <JsonLd id="public-speaking-kids-course-schema-zh" data={courseSchema} />
      <JsonLd id="public-speaking-kids-faq-schema-zh" data={faqSchema} />
      <JsonLd id="public-speaking-kids-breadcrumb-schema-zh" data={breadcrumbSchema} />

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
            面向 1-12 年级儿童的在线演讲课
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            为孩子开设的 Zoom 实时演讲课。小班教学、经验丰富的教练，以及一套「自信优先」的课程体系——
            既适合害羞的孩子，也适合未来想走竞赛辩论路线的孩子。
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
              查看我们的课程
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="核心信息"
        facts={[
          { label: "上课方式", value: "Zoom 在线直播" },
          { label: "适合谁", value: "希望提升自信、表达能力与沟通力的学生" },
          { label: "典型年龄", value: "1-12 年级" },
          { label: "班级人数", value: "通常 8-12 人" },
          { label: "反馈方式", value: "每节课后都有个性化的书面反馈" },
          { label: "下一步", value: "可以衔接辩论课或参加竞赛型演讲机会" },
        ]}
      />

      {/* 3-card value props */}
      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么 DSDC 的儿童演讲课有效
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            家长通常会从三件事上比较在线演讲课。下面是 DSDC 在每一点上的做法。
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {psValueProps.map((prop) => (
              <article
                key={prop.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{prop.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{prop.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming cohorts */}
      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            即将开课的演讲班
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            DSDC 在多个时区开设演讲班，让从温哥华到多伦多的加拿大家庭都能在合理的时间上课。具体开课时间每学期轮换——
            请预约咨询以锁定名额。
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {psCohorts.map((cohort) => (
              <article
                key={cohort.cohort}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                  {cohort.window}
                </p>
                <h3 className="mb-2 text-xl font-bold text-navy-800 dark:text-white font-serif">{cohort.cohort}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{cohort.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么儿童演讲课这么重要
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              儿童演讲课远远不止「学会讲话」那么简单。它教孩子如何组织自己的想法、清晰地表达，以及相信自己的声音。
              家长往往最先在学校展示和课堂发言上注意到效果，但长期影响远不止于此。扎实的演讲能力会支撑孩子的领导力、
              学术自信，以及生活方方面面的表达能力。
            </p>
            <p>
              对有些孩子来说，最大的收获是自信。一个以前从不在课堂上举手的孩子，开始更主动地回答问题。
              一个以前在新朋友面前紧张的学生，开始更自然地与人对视、把想法讲清楚。这些变化看似很小，却往往会彻底改变
              孩子对学校和社交场合的感受。
            </p>
            <p>
              演讲课还能让孩子成为更好的思考者。当孩子学会清晰地表达一个观点、用理由支持它、并根据听众做出调整时，
              他们正在练习的正是那种在写作、面试、领导岗位和后续辩论中都会用到的沟通能力。这也是为什么很多家庭
              把演讲课当作基础训练，而不是一个可有可无的兴趣班。
            </p>
            <p>
              家长通常也在考虑更具体的学术问题。他们希望孩子能从容地做项目展示、在课堂讨论中积极发言、
              在面试中表现自如，并能得体地与成年人沟通。一门好的儿童演讲课程会支撑所有这些目标，
              因为它教的是「如何在开口前组织好想法」，而不只是「如何在开口后听起来好听」。
            </p>
            <p>
              如果你正在把儿童演讲课和其他更广义的沟通课程做对比，可以参考我们的{" "}
              <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                完整课程矩阵
              </Link>
              、查看{" "}
              <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                收费详情
              </Link>
              ，以及读一下我们关于{" "}
              <Link
                href="/blog/public-speaking-benefits"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                演讲训练好处
              </Link>
              的文章。
            </p>
            <p>
              想更直观感受教学风格的家长，也可以先认识一下我们的{" "}
              <Link href="/zh/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                教练团队
              </Link>
              。这通常能帮家长理解 DSDC 是如何在温暖、结构与清晰的期待之间为低龄学生找到平衡的。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            孩子在 DSDC 演讲课上会学到什么
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: "自信与舞台感",
                text: "学生会学习如何站立、发声并以更稳的姿态讲话。教练会帮他们建立姿势、节奏、眼神接触，以及即使紧张也能听起来从容的能力。",
              },
              {
                title: "演讲结构与说服力",
                text: "孩子会学习如何把一个想法组织成开头、中间、结尾。他们还会练习用例子支持自己的观点——这同时会增强演讲和写作能力。",
              },
              {
                title: "即兴思维",
                text: "一门好的儿童演讲课应该教孩子如何在现场快速思考。我们会用快速题目和短篇发言轮，让孩子在时间压力下也能冷静回应。",
              },
              {
                title: "听众意识",
                text: "学生会学习根据听众调整语气、用词和例子。这会让他们不仅在舞台上更有说服力，也能在课堂讨论和小组合作中成为更好的沟通者。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              家长经常惊讶于这些技能迁移到其他领域的速度。孩子会更从容地应对口头展示、面试、课堂讨论，
              以及社团或小组项目中的领导角色。清晰表达的能力不只是帮到孩子在舞台上——它改变了孩子在日常学习中参与的方式。
            </p>
            <p>
              演讲课也是通往辩论最好的跳板之一。一旦孩子学会清晰表达、组织信息、并在听众面前保持冷静，之后想进一步学习
              直接论辩与反驳时，进入辩论课就会顺畅得多。很多家庭会把这个页面和我们的{" "}
              <Link
                href="/debate-classes-for-beginners"
                className="underline underline-offset-4 transition-colors hover:text-gold-500"
              >
                入门辩论页面
              </Link>{" "}
              放在一起看，用来决定哪条路径最适合自己的孩子。
            </p>
            <p>
              同样重要的是，学生会开始意识到「演讲是一项可以练出来的技能」，而不是「要么会、要么不会的天赋」。
              这种思维方式的转变，往往才是真正解锁长期自信的关键——因为孩子不再把每一次紧张的瞬间都解读为
              「我不擅长演讲」的证据。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            课堂结构与进阶
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "热身与短篇发言轮",
                text: "课堂通常从低压力的发言题目开始，让学生快速暖起来、立即开口。",
              },
              {
                title: "针对性技能讲解",
                text: "每节课都会教一项具体的沟通技能，比如演讲开头、说服性组织、声音表达或与听众建立连接。",
              },
              {
                title: "反馈与进步追踪",
                text: "学生会在课堂上得到直接反馈，课后再收到个性化书面笔记，让家长和学生都能看到稳步的成长。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                title: "基础阶段",
                text: "重点是舒适感、声音投射以及基础结构。害羞的学生在这里学会了「我也能做到」，而不是被一上来就推得太远。",
              },
              {
                title: "成长阶段",
                text: "随着自信的提升，学生开始处理更长的演讲、更强的说服性组织，以及对题目和提问的更即兴的回应。",
              },
              {
                title: "通向辩论或领导力",
                text: "对有些孩子来说，演讲本身就是最合适的长期方向。对另一些孩子来说，演讲则会成为通往辩论、学生领导力、面试准备或竞赛型沟通训练的桥梁。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              DSDC 的演讲课特别适合那些希望先走一条专注的沟通训练路径、而不是直接跳进正式辩论的孩子。
              它让孩子有机会定期练习、慢慢建立自信，并形成能延续到学业和领导力场景的表达习惯。
            </p>
            <p>
              家长也可以把演讲课当作进入我们更广义{" "}
              <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                辩论课程
              </Link>
              前的第一步。对一些孩子来说，演讲课本身就是最合适的长期选择。对另一些孩子来说，它会成为通往辩论、
              World Scholar&apos;s Cup 或更高级学术沟通训练的桥梁。如果你想了解谁会教你的孩子，也可以先认识一下我们的{" "}
              <Link href="/zh/team" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                教练团队
              </Link>
              。
            </p>
            <p>
              随着时间推移，家长往往会在远超课堂的场景里看到变化。孩子在学校里更自信地参与讨论，在面试或展示中表达得更清晰，
              也开始更主动地掌握「自己怎么沟通想法」这件事。这也是为什么青少年演讲训练常常被视为家庭在沟通发展上
              最具实操价值的长期投资之一。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            演讲能力如何在校内外发挥作用
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            {[
              {
                title: "课堂展示",
                text: "经常练习的孩子，在做学校展示时通常结构更清晰、紧张感也不那么明显。",
              },
              {
                title: "领导力与课堂参与",
                text: "表达更清晰的孩子，往往会在社团、小组项目、学生会和课堂讨论里贡献更多。",
              },
              {
                title: "面试与真实场景发言",
                text: "演讲习惯会迁移到试镜、面试、自我介绍等任何需要孩子把自己讲清楚的场合。",
              },
              {
                title: "通向辩论的基础",
                text: "因为孩子先学会了自信与结构，演讲课自然会成为之后进入辩论课的起点。",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              这就是为什么家长常常把儿童演讲课描述为「性价比最高的课外投资之一」。效果体现在日常生活里，
              而不仅仅在表演场合。一个能清晰、冷静表达的孩子，通常在学校、友谊和领导力场景里都会更加游刃有余。
            </p>
            <p>
              对那些在儿童演讲课和更正式的辩论课之间犹豫的家庭来说，问题通常不是课程质量，而是「孩子准备好了没」。
              如果孩子先需要的是自信、流畅度和当众发言的舒适感，那么演讲课往往是最合适的起点。如果你希望我们帮忙一起判断，
              最好的下一步还是{" "}
              <Link href="/zh/book" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                预约一次免费咨询
              </Link>
              。
            </p>
          </div>
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
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">
            准备好帮孩子成为更出色的表达者了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            浏览我们的{" "}
            <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              全部课程
            </Link>
            、查看{" "}
            <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              收费
            </Link>
            ，认识我们的{" "}
            <Link href="/zh/team" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              教练团队
            </Link>
            ，然后{" "}
            <Link href="/zh/book" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              预约免费咨询
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
              查看课程
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
