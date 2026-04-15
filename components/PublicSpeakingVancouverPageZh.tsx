import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "DSDC 的温哥华公共演讲课在哪里上？",
    answer:
      "DSDC 的总部在温哥华，但所有公共演讲课都通过 Zoom 直播进行。这意味着温哥华市区、Burnaby、Richmond、Surrey、Coquitlam、North Vancouver、West Vancouver 以及整个 Lower Mainland 的学生都可以在同一个班级里上课，完全不用通勤。",
  },
  {
    question: "课程适合哪些年龄的学生？",
    answer:
      "DSDC 为 1-12 年级的学生提供公共演讲课程，按年龄分组。小学低年级、初中和高中学生各自有独立的小组，确保教学内容和每个年龄段匹配。",
  },
  {
    question: "这是公共演讲课还是辩论课？",
    answer:
      "这是公共演讲课。学生会学习如何清晰表达、组织内容、应对即兴题目并自信上台。如果希望孩子学正式的辩论，可以查看我们的在线辩论课程页面，辩论建立在公共演讲的基础之上。",
  },
  {
    question: "DSDC 和其他温哥华的公共演讲课有什么不同？",
    answer:
      "DSDC 是一个由加拿大国家辩论队和顶尖大学辩手运营的线上项目，不是一个简单的兴趣班。每节课都是直播，班级很小（8-12 人），课后还有个性化书面反馈。小组课每小时 30-50 加元，比大多数线下温哥华项目便宜很多。",
  },
  {
    question: "孩子可以先试听一节课吗？",
    answer:
      "可以。先预约 15 分钟免费咨询，我们会根据孩子的年龄、自信程度和目标推荐最合适的班级。根据班级情况，有时也可以安排试听。",
  },
  {
    question: "温哥华以外的家庭也可以参加吗？",
    answer:
      "可以。我们服务 Burnaby、Richmond、Surrey、Coquitlam、North Vancouver、West Vancouver、New Westminster、Langley、Delta、White Rock 以及 BC 省的其他地区。",
  },
  {
    question: "公共演讲课收费多少？",
    answer:
      "DSDC 的小组公共演讲课每小时 30-50 加元。具体价格请查看价格页面，报名前所有费用都会公开。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "温哥华公共演讲课", path: "/zh/public-speaking-classes-vancouver" },
]);

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DSDC - 温哥华公共演讲课程",
  description:
    "面向温哥华、Burnaby、Richmond、Surrey 及 Lower Mainland 各地学生的在线公共演讲课程，由 DSDC 直播授课。",
  url: "https://dsdc.ca/public-speaking-classes-vancouver",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.2827,
    longitude: -123.1207,
  },
  email: "education@dsdc.ca",
  foundingDate: "2017",
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
    "White Rock",
  ],
};

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "温哥华公共演讲课程",
  description:
    "面向温哥华及 Lower Mainland 1-12 年级学生的线上公共演讲直播课程。",
  provider: {
    "@type": "EducationalOrganization",
    name: "DSDC",
    url: "https://dsdc.ca",
  },
  url: "https://dsdc.ca/public-speaking-classes-vancouver",
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
    audienceType: "Students in Grades 1-12",
  },
};

const valueProps = [
  {
    title: "Zoom 直播课",
    text: "每节课都是实时互动的直播。不用通勤、不用接送，但教学体验和线下工作室一样真实。",
  },
  {
    title: "小班教学",
    text: "每个班大约 8-12 人，确保每个孩子每周都能发言，都能得到教练的直接关注。",
  },
  {
    title: "经验丰富的教练",
    text: "DSDC 的教练来自加拿大国家辩论队、UBC、SFU 以及国际比赛圈。",
  },
];

const whatKidsLearn = [
  {
    title: "自信与台风",
    text: "姿态、声音投射、节奏控制，以及紧张时仍能显得从容的能力。自信不是天生的性格，而是可以被训练出来的技能。",
  },
  {
    title: "演讲结构",
    text: "如何把一个观点组织成有开头、中间和结尾的完整表达。如何用例子和证据支持自己的观点。",
  },
  {
    title: "即兴发言",
    text: "快速题目、短时间发言、压力下冷静思考。这是课堂讨论和面试最核心的能力。",
  },
  {
    title: "观众意识",
    text: "如何判断现场氛围，调整语气和用词，与面前的听众（同学、老师、家长或评委）建立连接。",
  },
];

const vancouverAreas = [
  "温哥华市中心",
  "Kitsilano 与西区",
  "Burnaby 与东温",
  "Richmond",
  "Surrey 与 White Rock",
  "Coquitlam 与 Port Moody",
  "North Vancouver 与 West Vancouver",
  "Langley 与 Delta",
];

export default function PublicSpeakingVancouverPageZh() {
  return (
    <>
      <JsonLd id="ps-vancouver-course-schema-zh" data={courseSchema} />
      <JsonLd id="ps-vancouver-faq-schema-zh" data={faqSchema} />
      <JsonLd id="ps-vancouver-local-business-schema-zh" data={localBusinessSchema} />
      <JsonLd id="ps-vancouver-breadcrumb-schema-zh" data={breadcrumbSchema} />

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
            温哥华家庭可在线参加的公共演讲课
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            面向 1-12 年级孩子的公共演讲直播课程，从温哥华出发，通过 Zoom 覆盖整个 Lower Mainland。小班教学，资深教练，以自信为核心的课程设计。
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
              查看所有课程
            </Link>
          </div>
        </div>
      </section>

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="课程核心信息"
        facts={[
          { label: "总部", value: "温哥华，BC" },
          { label: "授课形式", value: "Zoom 直播在线课" },
          { label: "适合年级", value: "1-12 年级" },
          { label: "班级规模", value: "通常 8-12 人" },
          { label: "教练来源", value: "加拿大国家辩论队及 BC 顶尖大学辩手" },
          { label: "服务区域", value: "温哥华、Burnaby、Richmond、Surrey、Coquitlam、North Vancouver 及 BC 其他地区" },
          { label: "收费", value: "小组课 30-50 加元/小时" },
          { label: "下一步", value: "预约 15 分钟免费咨询" },
        ]}
      />

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么温哥华家长选择 DSDC 公共演讲课
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-center text-base md:text-lg leading-relaxed text-charcoal/70 dark:text-navy-200 font-sans">
            Lower Mainland 家庭在对比公共演讲课程时最关心三件事，DSDC 是这样处理它们的。
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {valueProps.map((prop) => (
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

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            温哥华学生的公共演讲路径
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              温哥华家庭的选择其实很多。DSDC 真正的差异化在于：每节课都由实际在公共演讲和辩论领域有过高水平比赛经验的教练亲自带。这种经验会让反馈非常具体——孩子得到的是关于姿态、声音投射、节奏和结构的建议，而不是笼统的鼓励。
            </p>
            <p>
              因为课程是线上进行，Kitsilano 的学生能和 Burnaby、Richmond、North Vancouver、Surrey 的同龄人一起上课。Lower Mainland 地理跨度大，线下兴趣班往往意味着高峰时段的长距离接送，很容易影响坚持度。DSDC 直接解决这个问题，让家庭可以稳定地参加一个完整学期——而稳定性才是孩子真正进步的关键。
            </p>
            <p>
              家长还会注意到 DSDC 的公共演讲课非常重视年龄匹配。小学生不会被推入高压环境，高中学生也不会被困在初级练习里。每个孩子都会被分到和年级与自信程度匹配的小组。
            </p>
            <p>
              想更完整地了解 DSDC 的课程，可以查看{" "}
              <Link href="/zh/public-speaking-classes-for-kids" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                公共演讲主页面
              </Link>{" "}
              了解课程内容，或者查看{" "}
              <Link href="/zh/debate-classes-vancouver" className="underline underline-offset-4 transition-colors hover:text-gold-500">
                温哥华辩论课页面
              </Link>{" "}
              了解辩论路径的进阶内容。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            学生在 DSDC 公共演讲课里学什么
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {whatKidsLearn.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{item.title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            Lower Mainland 常见参加地区
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vancouverAreas.map((area) => (
              <div
                key={area}
                className="rounded-2xl border border-warm-200 bg-warm-50 px-4 py-5 text-center text-sm font-medium text-navy-800 shadow-sm dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              >
                {area}
              </div>
            ))}
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
            准备为孩子报一节温哥华公共演讲课吗？
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            预约 15 分钟免费咨询。我们会根据孩子的年级、自信程度和目标推荐最合适的班级。
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
