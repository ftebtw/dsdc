import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "如何晋级 World Scholar's Cup？",
    answer:
      "学生需要在 Regional Round（区域赛）中取得足够高的团队或个人排名，才能拿到 Global Round（全球赛）的晋级资格。Global Round 中表现优异的学者可以进一步晋级耶鲁大学举办的 Tournament of Champions（冠军赛）。DSDC 全程指导学生准备每一个阶段——自 2020 年起，我们的学员保持 100% 晋级率。",
  },
  {
    question: "World Scholar's Cup 2026 的主题是什么？",
    answer:
      "World Scholar's Cup 每年都会发布一个全新的课程主题，这个主题贯穿六个学科领域。2026 年主题一公布，DSDC 就会立即更新教学计划。已报名我们 WSC 小组的家庭可以在第一节课前拿到按主题整理的阅读清单、课程大纲以及学期准备时间表。",
  },
  {
    question: "World Scholar's Cup 的费用贵吗？",
    answer:
      "比赛费用取决于孩子参加的是哪一轮。Regional Round 的报名费一般在 100-200 美元左右。Global Round 和耶鲁 Tournament of Champions 费用更高，因为家庭需要前往举办城市。DSDC 的教学费用是每小时 30-50 加元的小组课价格，比大多数 WSC 辅导项目都便宜很多。",
  },
  {
    question: "World Scholar's Cup 适合哪个年龄、哪个年级？",
    answer:
      "4-12 年级的学生都可以参加。比赛分两个组别：Junior（大致 4-7 年级）和 Senior（大致 8-12 年级）。DSDC 同时为两个组别的学生提供教学，并把他们安排到年龄与经验相近的班级里。",
  },
  {
    question: "我的孩子没有辩论经验，可以报 WSC 课程吗？",
    answer:
      "完全可以。WSC 的确把辩论作为四个项目之一，但它并不是纯辩论比赛。很多学生从零开始、没有任何辩论背景，最后依然表现很好。我们的教学会从头开始准备四个项目：Team Debate、Collaborative Writing、Scholar's Challenge 和 Scholar's Bowl。",
  },
  {
    question: "WSC 课程一年中什么时候开课？",
    answer:
      "WSC 课程是赛季制的，跟比赛日程表对齐。大多数家庭在 Regional Round 前几个月开始准备，在 Global Round 和耶鲁 Tournament of Champions 前还会安排额外的集训课。请联系我们了解当前赛季的课表和班次时间。",
  },
  {
    question: "WSC 教学课程的费用是多少？",
    answer:
      "WSC 课程沿用 DSDC 小组课的标准收费：每小时 30-50 加元。准备 Global Round 或耶鲁 Tournament of Champions 的学生也可以选择一对一或小班私教。详情请看价格页面。",
  },
  {
    question: "World Scholar's Cup 比赛在哪里举办？",
    answer:
      "Regional Round 分布在全球各大城市，包括加拿大的多个城市。Global Round 每年在不同的国际城市轮流举办——过去的举办地包括北京、曼谷、悉尼、迪拜、阿姆斯特丹和德班。Tournament of Champions 则每年都在美国耶鲁大学（康涅狄格州纽黑文）举行。",
  },
  {
    question: "DSDC 的 World Scholar's Cup 晋级率是多少？",
    answer:
      "自 2020 年以来，每一位参加 World Scholar's Cup 区域赛的 DSDC 学员都成功晋级。这意味着从 Regional Round 到 Global Round，一直到耶鲁 Tournament of Champions，我们保持 100% 晋级率——这是我们非常引以为豪的记录。",
  },
  {
    question: "WSC 和传统辩论比赛有什么区别？",
    answer:
      "传统辩论比赛几乎只考察口头表达与论辩能力。World Scholar's Cup 则是一个跨学科的学术综合比赛，把辩论与创意写作、多选题考试以及团队多媒体答题结合起来。它既奖励辩论实力，也奖励好奇心与知识的广度。",
  },
  {
    question: "孩子每周要花多少时间准备 WSC？",
    answer:
      "一般情况下，DSDC 的 WSC 学员每周上一节直播课（通常是两小时），并在课外完成少量阅读或练习作业。准备 Global Round 或耶鲁 Tournament of Champions 的学生临近比赛时通常会增加到每周两次课。",
  },
  {
    question: "加拿大以外的孩子可以报 WSC 课程吗？",
    answer:
      "可以。DSDC 全部课程都通过 Zoom 直播进行，世界各地的学生只要能在合理的当地时间上课，都可以加入。我们已经指导过来自北美、亚洲等地的 WSC 学员。",
  },
  {
    question: "WSC 对大学申请有帮助吗？",
    answer:
      "有帮助。WSC 能给学生带来可量化的成绩（区域晋级、全球晋级、Tournament of Champions 入围）、跨六大学科的知识储备，以及关于团队合作、写作与演讲的面试素材。招生官普遍看重 WSC 这种结构化、有进阶路径的课外活动。",
  },
];

const prepareForWsc = [
  {
    title: "第一步：先搞懂赛制",
    text: "在孩子开始准备之前，先把四个项目——Team Debate、Collaborative Writing、Scholar's Challenge、Scholar's Bowl——的规则了解清楚。先弄懂格式，再开始练习，才不会浪费时间。",
  },
  {
    title: "第二步：读透当年的课程大纲",
    text: "WSC 每个赛季都有一个主题课程，覆盖 Science、History、Art & Music、Literature、Social Studies 以及 Special Area。先从官方大纲入手，再从那里建立阅读清单。",
  },
  {
    title: "第三步：加入有老师带的班级",
    text: "纯自学很难坚持下来。一个有老师带的班级会给孩子一个清晰的课表、外部问责、书面反馈以及每周一起练习的同伴——这是决定学生是否能晋级的最大因素。",
  },
  {
    title: "第四步：每周做模拟训练",
    text: "模拟辩论、限时写作以及 Scholar's Challenge 模拟考试能在区域赛前几个月就暴露出学生的弱点。DSDC 的模拟训练会完全复刻真实比赛环境，学生上场时自然不会紧张。",
  },
  {
    title: "第五步：优先练 Team Debate 和 Collaborative Writing",
    text: "这两个项目最容易通过教学提升，也最经常决定一支队伍能否晋级。应该在这两项上花最多的准备时间——等口头表达与写作基础打牢后，再叠加 Scholar's Bowl 节奏训练和 Scholar's Challenge 的知识复习。",
  },
  {
    title: "第六步：晋级后尽早安排行程",
    text: "通过 Regional Round 之后，家庭需要提前几周安排 Global Round 的出行。DSDC 会帮你判断哪个 Global Round 举办城市最适合你的时间安排，以及晋级之后的训练量大概是多少。",
  },
];

const wscEvents = [
  {
    title: "Team Debate",
    subtitle: "口头表达项目",
    text: "三人一队，围绕与课程相关的议题进行 British Parliamentary 风格的辩论。每位学生都要完成一段建构性陈词、回应 Points of Information，并把历史、科学、文学和时事里的论点串联起来。DSDC 教 Team Debate 的方法和核心辩论课完全一致——结构化的立论训练、反驳练习、DSDC 内部队伍之间的实战演练——所以学生走上区域赛场时，对赛制早已驾轻就熟。",
    preparesFor: "Team Debate 通常是有辩论训练的学生得分最高的项目，这也是 DSDC 以辩论为核心的教学方法能在 WSC 取得出色成绩的原因。",
  },
  {
    title: "Collaborative Writing",
    subtitle: "团队论文项目",
    text: "学生需要针对当年课程中挑选出的若干题目之一，合作完成一篇论文。队伍有固定时间一起构思、起草和润色，所以写作流畅度、学科知识和团队协作缺一不可。DSDC 会训练写作结构、题目分析以及时间管理习惯，帮助学生在压力下也能交出一篇完成度高的作品。",
    preparesFor: "Collaborative Writing 的分数，常常是决定一支队伍能否晋级的关键差异点。",
  },
  {
    title: "Scholar's Challenge",
    subtitle: "个人学术考试",
    text: "一份 120 题的多项选择考卷，覆盖当年课程的六大学科。和普通考试不同，Scholar's Challenge 的题目往往没有唯一正确答案，学生需要在时间压力下权衡选项、做出推理。DSDC 会用课程地图、主动回忆复习法以及限时模拟考，帮学生走进考场时带着真正的策略，而不是单纯靠「我应该读得够多了吧」。",
    preparesFor: "Scholar's Challenge 是最考验个人准备程度的项目，也是自学 WSC 学生最容易低估的环节。",
  },
  {
    title: "Scholar's Bowl",
    subtitle: "团队多媒体答题",
    text: "一个节奏飞快、由团队作答的综艺式答题节目，题目融合图像、音频、视频和文字。队伍必须在严格的时间限制内共同作答，所以学生要学会快速沟通、相信队友的直觉。DSDC 通过实时模拟、团队抢答训练以及学科知识复习，帮学生同时建立起知识储备和团队默契。",
    preparesFor: "Scholar's Bowl 奖励的是练过磨合的队伍——不是单打独斗的学霸。",
  },
];

const wscSubjects = [
  {
    title: "Science（科学）",
    text: "每个赛季的课程都会轮换一个主题化的科学领域——天文、神经科学、遗传学、环境科学等等。学生不仅学习事实本身，更学习科学家如何思考不确定性与证据。",
  },
  {
    title: "History（历史）",
    text: "历史模块会挑选一个时代、地区或主题，并把它与当年整体课程联系起来。学生要读原始文献、比较不同历史学家的观点、培养解释性思维——这也正是强辩手需要的底层能力。",
  },
  {
    title: "Art & Music（艺术与音乐）",
    text: "WSC 非常重视艺术与音乐——学生会围绕当年主题研究特定作品、流派和作曲家。这往往是那些不那么传统学术型的学生最能发光的一项，因为它奖励的是审美判断和比较分析能力。",
  },
  {
    title: "Literature（文学）",
    text: "文学模块覆盖课程指定的长篇小说、短篇故事与诗歌。学生练习精读、主题分析和角色论证——这些技能会直接反哺 Team Debate 和 Collaborative Writing 两个项目。",
  },
  {
    title: "Social Studies（社会研究）",
    text: "社会研究涵盖经济学、政治理论、社会学、心理学和文化。这通常是 Team Debate 议题里最常出现的学科，所以准备充分的话会有双倍收益。",
  },
  {
    title: "Special Area（特别专题）",
    text: "每年的 Special Area 都是当季独有的全新主题——有时是几个学科的混合，有时是概念驱动的议题。它奖励那些好奇心强、能快速在不同学科之间建立联系的学生。",
  },
];

const preparationTimeline = [
  {
    phase: "基础阶段（第 1-2 个月）",
    title: "打好底子",
    text: "学生从当年的课程概览、入门阅读和辩论基础开始。早期课程重点是理解六大学科、熟悉每个项目的格式，并在压力较小的环境中练习短篇发言。",
  },
  {
    phase: "技能构建（第 3-4 个月）",
    title: "逐项专攻",
    text: "每周课程转向针对性训练，分别打磨 Team Debate、Collaborative Writing、Scholar's Challenge 和 Scholar's Bowl。学生会分成双人或小组合作，拿到书面反馈，开始限时练习，为真实比赛的压力做好准备。",
  },
  {
    phase: "区域赛准备（第 5 个月）",
    title: "赛前彩排",
    text: "模拟训练完全按照区域赛条件进行：完整时长的辩论、限时写作、Scholar's Challenge 模拟考、实时 Bowl 答题。教练会诊断具体弱点，并为每位学生制定个性化的最后一周计划。",
  },
  {
    phase: "Global Round 和之后",
    title: "冲击全球与耶鲁",
    text: "晋级 Global Round 的学生会进入更密集的集训组，接受更深入的内容复习、更高级的写作训练，以及更高强度的模拟训练。准备耶鲁 Tournament of Champions 的学生还会得到额外的一对一指导。",
  },
];

const whyDsdcForWsc = [
  {
    title: "自 2020 年起 100% 晋级率",
    text: "自 2020 年以来，每一位参加区域赛的 DSDC 学员都成功晋级下一阶段。这个记录非常罕见，原因很简单——大多数 WSC 项目做不到这一点，因为它们不是以辩论为核心搭建的。",
  },
  {
    title: "以辩论为核心的教练团队",
    text: "我们的教练来自加拿大国家辩论队、UBC、SFU 以及重要国际辩论赛事。这直接提升 Team Debate 的分数，同时也增强 Collaborative Writing 中的论证质量。",
  },
  {
    title: "跨学科课程支持",
    text: "因为 DSDC 平时也在教常规辩论课，所以我们的学生早就习惯在课堂上讨论历史、科学和哲学。这种熟悉感让 WSC 的学科复习感觉不像临时突击，更像在已有基础上加深理解。",
  },
  {
    title: "真正的耶鲁级成绩记录",
    text: "我们的学生曾前往北京、阿姆斯特丹、悉尼和纽黑文（耶鲁）参赛。我们知道高级别比赛真正需要什么，并且从第一节课起就按照这个标准来教学。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "World Scholar's Cup 教学", path: "/zh/world-scholars-cup-coaching" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "World Scholar's Cup 教学与备赛",
  description:
    "DSDC 为 4-12 年级学生提供 World Scholar's Cup 在线教学。自 2020 年起保持 100% 晋级率，从区域赛一直带到耶鲁 Tournament of Champions。四个 WSC 项目全部覆盖。",
  provider: {
    "@type": "EducationalOrganization",
    name: "Debate & Speech Development Community (DSDC)",
    sameAs: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/zh/world-scholars-cup-coaching",
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseWorkload: "PT2H",
    instructor: {
      "@type": "Organization",
      name: "DSDC",
    },
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
    audienceType: "4-12 年级学生",
  },
};

export default function WorldScholarsCupCoachingPageZh() {
  return (
    <>
      <JsonLd id="wsc-course-schema-zh" data={courseSchema} />
      <JsonLd id="wsc-faq-schema-zh" data={faqSchema} />
      <JsonLd id="wsc-breadcrumb-schema-zh" data={breadcrumbSchema} />

      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4 text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-gold-300">
            加拿大顶级 World Scholar&apos;s Cup 教学项目
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            加拿大 World Scholar&apos;s Cup 教学
          </h1>
          <p className="text-xl text-white/90 font-sans mb-10 max-w-4xl mx-auto">
            覆盖全部四个 World Scholar&apos;s Cup 项目的在线直播教学——Team Debate、Collaborative Writing、
            Scholar&apos;s Challenge 和 Scholar&apos;s Bowl。自 2020 年起，从区域赛到耶鲁
            Tournament of Champions，每年保持 100% 晋级率。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/zh/book"
              className="px-8 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-md text-center"
            >
              预约免费咨询
            </Link>
            <Link
              href="/zh/classes"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy-800 transition-all duration-200 text-center"
            >
              查看 WSC 课程详情
            </Link>
          </div>
        </div>
      </section>

      {/* Proof strip above the fold */}
      <section className="bg-gold-400 dark:bg-gold-500/90 py-6 md:py-7">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">100%</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">自 2020 年起的 WSC 晋级率</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">4</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">全部 WSC 项目覆盖</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">耶鲁</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">Tournament of Champions 学员</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-900">2017</div>
              <div className="text-xs md:text-sm font-semibold text-navy-900/85 mt-1">开始教学的年份</div>
            </div>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/Course"
        title="核心信息"
        facts={[
          { label: "课程项目", value: "World Scholar's Cup 备赛" },
          { label: "晋级率", value: "自 2020 年起 100%，从区域赛一路到耶鲁 Tournament of Champions" },
          { label: "上课方式", value: "Zoom 在线直播" },
          { label: "课时安排", value: "赛季制，每周 1-2 次，每次 2 小时" },
          { label: "适合年级", value: "4-12 年级（Junior 和 Senior 两个组别）" },
          { label: "收费标准", value: "每小时 30-50 加元（小组课）；可选一对一私教" },
          { label: "比赛举办地", value: "北京、阿姆斯特丹、悉尼、迪拜、德班以及耶鲁大学" },
          { label: "项目覆盖", value: "Team Debate、Collaborative Writing、Scholar's Challenge、Scholar's Bowl" },
          { label: "学科覆盖", value: "Science、History、Art & Music、Literature、Social Studies、Special Area" },
          { label: "教练团队", value: "以辩论为核心，来自 UBC、SFU 以及加拿大国家辩论队" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-800 dark:text-white mb-8 text-center">
            什么是 World Scholar&apos;s Cup？
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              World Scholar&apos;s Cup（WSC）是一项面向所有年龄段学生的全球学术综合比赛，创立于 2006 年。它由四个项目组成：
              Team Debate、Collaborative Writing、Scholar&apos;s Challenge（120 题的多选考试），以及 Scholar&apos;s Bowl
              （团队多媒体答题）。对很多家庭来说，WSC 是孩子接触的第一个国际大赛，而且把演讲、写作、批判性思维和团队合作
              融合在一个项目里。
            </p>
            <p>
              学生先在世界各地的 Regional Round 中比赛，然后晋级 Global Round（举办地包括北京、阿姆斯特丹、悉尼、迪拜、
              德班等），最顶尖的学者还会进一步晋级每年在耶鲁大学举办的 Tournament of Champions。这三级进阶让学生能从本地
              起步、一路走到世界级的舞台——这也是一段让大学申请材料非常亮眼的故事。
            </p>
            <p>
              WSC 以跨学科而闻名。每一季的课程都覆盖六大学科——Science、History、Art &amp; Music、Literature、
              Social Studies 以及 Special Area——而且主题都设计得非常引人深思。WSC 奖励的是好奇心、视角和思维灵活度，
              而不是死记硬背，这也是为什么很多从辩论出发的 DSDC 学员最终都会爱上 WSC。
            </p>
            <p>
              对于 4-12 年级的学生来说，WSC 是最值得投入的学术旅程之一。除了奖牌和排名，WSC 还能帮孩子建立自信、沟通能力，
              以及一个热爱学习的全球伙伴社群。DSDC 是加拿大顶级 WSC 教学项目，帮助温哥华、多伦多、卡尔加里、渥太华以及
              加拿大各地的学生准备好比赛的每一个阶段。
            </p>
          </div>
        </div>
      </section>

      {/* Four WSC events explained */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            World Scholar&apos;s Cup 的四个项目详解
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            WSC 并不是一场考试，而是四个独立项目的组合，每个项目奖励的是不同的思维能力——一个真正强的学者需要在四个项目上都做好准备。
            下面是每个项目的真实样子，以及 DSDC 是怎么教的。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wscEvents.map((event) => (
              <article
                key={event.title}
                className="flex flex-col rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 shadow-sm"
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                  {event.subtitle}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-navy-800 dark:text-white mb-3 font-serif">
                  {event.title}
                </h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed mb-4">{event.text}</p>
                <p className="mt-auto text-sm text-navy-700 dark:text-gold-300 font-sans italic leading-relaxed">
                  {event.preparesFor}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Six subject areas */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            WSC 的六大学科
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            每个 WSC 赛季都会围绕一个全新主题，覆盖六大学科。四个项目——Team Debate、Collaborative Writing、
            Scholar&apos;s Challenge、Scholar&apos;s Bowl——的题目都来自这六大学科，所以从第一天起，准备就必须是跨学科的。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {wscSubjects.map((subject) => (
              <article
                key={subject.title}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-5"
              >
                <h3 className="text-lg font-bold text-navy-800 dark:text-white mb-2">{subject.title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed text-sm">{subject.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-6">
            DSDC 的 World Scholar&apos;s Cup 成绩
          </h2>
          <p className="text-center text-2xl md:text-3xl font-bold text-gold-600 dark:text-gold-300 mb-6">
            自 2020 年起 100% 晋级率
          </p>
          <p className="text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans text-center max-w-4xl mx-auto">
            自 2020 年以来，每一位参加 World Scholar&apos;s Cup 区域赛的 DSDC 学员都成功晋级——从 Regional Round、
            Global Round 到耶鲁 Tournament of Champions，全程无一掉队。这是我们非常引以为豪的记录，
            也是学生和家长选择与我们一起训练时真正能拿到的东西。
          </p>
          <p className="text-base text-charcoal/70 dark:text-navy-300 font-sans text-center mt-4">
            我们的学员曾前往北京、阿姆斯特丹、悉尼、德班、迪拜，以及纽黑文（耶鲁）参赛。
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-10">
            DSDC 如何帮学生准备 World Scholar&apos;s Cup
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              "按 WSC 比赛日程排布的赛季制课程（每周 1-2 次，每次 2 小时）",
              "完整覆盖全部六大 WSC 学科",
              "针对 Team Debate、Collaborative Writing、Scholar's Challenge 和 Scholar's Bowl 的专项训练",
              "模拟比赛与限时练习，帮学生建立真实压力下的自信",
              "根据每位学生的强项与弱项量身定制反馈与复习计划",
              "按 Collaborative Writing 赛制设计的团队写作工作坊",
              "配备多媒体题库的 Scholar's Bowl 模拟训练",
              "全程 Zoom 直播，加拿大全国乃至世界各地的学生都能参加",
            ].map((point) => (
              <div
                key={point}
                className="rounded-xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 px-4 py-3 text-sm sm:text-base text-navy-800 dark:text-navy-100"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WSC preparation timeline */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            DSDC 一个典型 WSC 备赛季的样子
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            好的 WSC 成绩来自一个真实的训练弧线，而不是临时突击。下面是从第一节课到 Tournament of Champions，
            一个典型 DSDC 备赛季的样子。
          </p>
          <div className="space-y-5">
            {preparationTimeline.map((phase, index) => (
              <article
                key={phase.title}
                className="flex flex-col gap-2 rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6 md:flex-row md:items-start md:gap-6 shadow-sm"
              >
                <div className="flex shrink-0 items-center gap-3 md:w-56">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-900">
                    {index + 1}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300 font-sans">
                    {phase.phase}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-2 font-serif">{phase.title}</h3>
                  <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{phase.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How to Prepare for WSC */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            如何准备 World Scholar&apos;s Cup
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            好的 WSC 准备是有顺序的，不是东拼西凑。下面是 DSDC 对每个学生都在用的实战路径——无论他们是第一次参加区域赛，
            还是要冲击耶鲁 Tournament of Champions。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {prepareForWsc.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6 shadow-sm"
              >
                <h3 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WSC 2026 theme */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-6">
            World Scholar&apos;s Cup 2026 主题与课程
          </h2>
          <div className="space-y-5 text-charcoal/80 dark:text-navy-200 text-lg leading-relaxed font-sans">
            <p>
              每一季 World Scholar&apos;s Cup 都围绕一个全新主题展开，这个主题贯穿六大学科和四个项目。
              2026 年的主题会决定从 Literature 的阅读清单、到 Social Studies 的案例研究、再到 Team Debate 的议题走向的一切——
              所以用「主题感知式」课程准备的学生，往往会比那些拿着去年大纲死啃的学生表现好很多。
            </p>
            <p>
              2026 主题一发布，DSDC 就会立即重建 WSC 小组的教学大纲。我们的教练会把官方课程大纲映射到每周课程里，
              布置与主题相关的阅读清单，并用当年题目直接设计模拟训练。学生走进区域赛场时，对 WSC 评审最看重的
              学科联系早已驾轻就熟。
            </p>
            <p>
              如果你想了解当前主题、最新课程公告，以及我们为新赛季做了哪些调整，最快的方法是{" "}
              <Link href="/zh/book" className="underline underline-offset-4 hover:text-gold-500 transition-colors">
                预约免费咨询
              </Link>
              。我们会分享当前主题、解释它如何映射到每个项目，并根据孩子的年级与经验推荐最合适的起点班级。
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-8">
            World Scholar&apos;s Cup 适合你的孩子吗？
          </h2>
          <div className="space-y-5 text-lg text-charcoal/80 dark:text-navy-200 leading-relaxed font-sans">
            <p>
              WSC 非常适合那些好奇心强、喜欢跨学科学习的孩子。你的孩子不需要有辩论基础就能开始——很多 DSDC 的 WSC 学生
              是第一次尝试竞赛型学术活动，依然能在第一次参赛就晋级。
            </p>
            <p>
              4-12 年级的学生都可以参加。较低年级的学生参加 Junior 组，较高年级的学生参加 Senior 组。
              两个组别使用同样的课程，只是对不同年龄的学生有不同的预期要求。
            </p>
            <p>
              如果你的孩子喜欢阅读、冷知识、写作或思辨性讨论，WSC 是一个非常自然的选择。如果孩子已经在上我们的{" "}
              <Link
                href="/zh/online-debate-classes"
                className="underline underline-offset-4 hover:text-navy-800 dark:hover:text-gold-300 transition-colors"
              >
                在线辩论课
              </Link>
              ，那么加上 WSC 是最值得尝试的下一步之一。
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-12">
            World Scholar&apos;s Cup 比赛进阶路径
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Regional Round（区域赛）",
                text: "在全球多个城市举办，包括加拿大的几个城市。表现最好的队伍可以晋级 Global Round。",
              },
              {
                step: "2",
                title: "Global Round（全球赛）",
                text: "在大型国际城市举办（北京、阿姆斯特丹、悉尼、德班、迪拜等）。顶尖学者可以晋级 Tournament of Champions。",
              },
              {
                step: "3",
                title: "Tournament of Champions（冠军赛）",
                text: "每年在耶鲁大学（康涅狄格州纽黑文）举行。WSC 的最高殿堂，也是晋级学生心目中一年中最棒的一周。",
              },
            ].map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-white dark:bg-navy-800 p-6"
              >
                <p className="text-gold-500 font-bold text-sm uppercase tracking-wide mb-3">第 {item.step} 阶段</p>
                <h3 className="text-xl font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-charcoal/70 dark:text-navy-300 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="text-center text-base text-charcoal/70 dark:text-navy-300 font-sans mt-8">
            DSDC 学员自 2020 年起保持 100% 晋级率，已经完整走完三个阶段。
          </p>
        </div>
      </section>

      {/* Why DSDC for WSC */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            家长为什么选择 DSDC 做 World Scholar&apos;s Cup 教学
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            市面上有不少 WSC 教学机构。下面是 DSDC 与众不同的地方——以及我们能拿到这个晋级记录的原因。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {whyDsdcForWsc.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 dark:border-navy-700 bg-warm-50 dark:bg-navy-800 p-6 shadow-sm"
              >
                <h3 className="text-lg md:text-xl font-bold text-navy-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-charcoal/75 dark:text-navy-200 font-sans leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
            World Scholar&apos;s Cup 常见问题
          </h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-white dark:bg-navy-800 rounded-xl overflow-hidden shadow-sm border border-warm-200 dark:border-navy-700"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between p-4 sm:p-5 hover:bg-warm-50 dark:hover:bg-navy-700/50 transition-colors">
                  <span className="text-navy-800 dark:text-navy-100 font-semibold pr-4 text-sm sm:text-base font-sans">
                    {item.question}
                  </span>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-navy-800 dark:bg-navy-600 text-white flex items-center justify-center">
                    +
                  </span>
                </summary>
                <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-charcoal/70 dark:text-navy-200 leading-relaxed font-sans">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related reading */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy-800 dark:text-white mb-4">
            继续了解 DSDC
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base text-charcoal/70 dark:text-navy-200 font-sans leading-relaxed">
            WSC 与我们的辩论课和演讲课可以非常自然地搭配在一起。看看下面这些页面，了解家长是如何为孩子构建完整训练方案的。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                href: "/zh/online-debate-classes",
                title: "在线辩论课",
                description:
                  "我们的核心辩论课程，直接提升 WSC Team Debate 项目的表现。",
              },
              {
                href: "/zh/classes",
                title: "全部 DSDC 班级等级",
                description:
                  "对比我们从入门辩论到高级竞赛训练的完整课程矩阵。",
              },
              {
                href: "/debate-classes-canada",
                title: "加拿大各地辩论课",
                description:
                  "DSDC 如何通过在线直播课服务加拿大每一个省份的学生。",
              },
              {
                href: "/zh/pricing",
                title: "收费与套餐",
                description:
                  "WSC 以及所有 DSDC 课程的透明小组课定价。",
              },
              {
                href: "/zh/team",
                title: "认识 DSDC 教练团队",
                description:
                  "DSDC 100% WSC 晋级率背后那支以辩论为核心的教练团队。",
              },
              {
                href: "/blog/world-scholars-cup",
                title: "WSC 博客概览",
                description:
                  "更深入地了解为什么 WSC 值得参加，以及学生能从中得到什么。",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group block rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-2 text-lg font-bold text-navy-800 transition-colors group-hover:text-gold-500 dark:text-white dark:group-hover:text-gold-300">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            准备好开启孩子的 World Scholar&apos;s Cup 之旅了吗？
          </h2>
          <p className="text-lg text-white/80 font-sans leading-relaxed max-w-3xl mx-auto mb-8">
            最好的起点是一次 15 分钟的免费咨询。我们会一起聊聊孩子的年级、自信程度和目标，然后为本赛季推荐最合适的 DSDC
            WSC 小组班级。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/zh/book"
              className="px-8 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-all duration-200 shadow-md text-center"
            >
              预约免费咨询
            </Link>
            <Link
              href="/zh/classes"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy-800 transition-all duration-200 text-center"
            >
              查看课程
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
