import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import KeyFactsBox from "@/components/KeyFactsBox";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";

const faqItems = [
  {
    question: "DSDC 在多伦多也有线下校区吗？",
    answer:
      "DSDC 创立于温哥华，课程以 Zoom 直播形式进行，所以多伦多和 GTA 学生可以直接在线加入，无需通勤。",
  },
  {
    question: "GTA 学生在线上课会不会发言机会不够？",
    answer:
      "不会。班级规模通常控制在 8-12 人，确保每位学生都能参与发言、练习与获得反馈。",
  },
  {
    question: "多伦多学生会学哪些辩论赛制？",
    answer:
      "会根据程度接触 CNDF、British Parliamentary、World Schools、Cross-Examination，以及公共演讲与学术表达训练。",
  },
  {
    question: "报名前可以先了解适合哪个班吗？",
    answer:
      "可以。最好的方式是先预约免费咨询，我们会根据年级、经验和目标推荐最适合的课程。",
  },
];

const faqSchema = buildFaqSchema(faqItems);
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "首页", path: "/zh" },
  { name: "多伦多辩论课程", path: "/zh/debate-classes-toronto" },
]);

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      position: 1,
      name: "多伦多与 GTA 在线辩论课程",
      description: "面向多伦多、Brampton、Mississauga 等地区学生的在线辩论训练。",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
    {
      "@type": "Course",
      position: 2,
      name: "GTA 公共演讲与辩论训练",
      description: "帮助学生提升自信、结构表达和更高水平的论证能力。",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
    },
  ],
};

export default function TorontoLandingPageZh() {
  return (
    <>
      <JsonLd id="toronto-course-schema-zh" data={courseSchema} />
      <JsonLd id="toronto-faq-schema-zh" data={faqSchema} />
      <JsonLd id="toronto-breadcrumb-schema-zh" data={breadcrumbSchema} />

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
            多伦多与 GTA 家庭可在线参加的辩论课程
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl font-sans text-white/90">
            面向 Toronto、Brampton、Mississauga、Scarborough、North York、Markham、Vaughan 等地区学生的直播辩论与公共演讲课程。
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

      <KeyFactsBox
        itemType="https://schema.org/EducationalOrganization"
        title="课程重点信息"
        facts={[
          { label: "授课形式", value: "Zoom 直播小班课" },
          { label: "适合学生", value: "4 至 12 年级及以上" },
          { label: "班级规模", value: "通常 8-12 人" },
          { label: "覆盖地区", value: "Toronto、Brampton、Mississauga、Scarborough、North York、Markham、Vaughan 等" },
          { label: "课程重点", value: "辩论、公共演讲、竞赛训练、自信建立" },
          { label: "价格方式", value: "官网公开透明价格" },
        ]}
      />

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            为什么多伦多家庭会选择线上辩论
          </h2>
          <div className="space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              对 GTA 家庭来说，线上模式最直接的价值就是节省通勤。多伦多本身跨度大，交通情况复杂，孩子每周为了上一节课往返很久，其实很容易影响坚持度。线上直播课能保留高互动和高参与，同时让家庭安排更可持续。
            </p>
            <p>
              很多家长也会发现，“离家近”并不一定等于“最适合”。真正决定孩子成长速度的，通常是班级大小、教练反馈质量、课程分层是否合理，以及学生能不能长期稳定参加。DSDC 的设计重点一直是这些长期结果，而不是只追求地理上的便利。
            </p>
            <p>
              此外，GTA 家庭常常希望孩子既能提升学校里的表达和展示能力，又能为更正式的辩论比赛做准备。DSDC 能提供从公共演讲到高阶赛制训练的完整路径，所以孩子不需要在不同机构之间反复切换。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            多伦多学生常见的课程选择
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              ["入门与 Junior 辩论课程", "适合希望建立表达自信、逻辑结构和回应能力的学生，是很多家庭的第一步。"],
              ["Senior 与 Advanced 竞赛训练", "适合年纪更大、目标更明确的学生，课程会更贴近高水平比赛和复杂议题训练。"],
              ["公共演讲课程", "如果孩子暂时还不适合直接进入辩论，公共演讲往往是非常好的过渡路径。"],
              ["更完整的加拿大辩论理解", "很多家长会同时阅读加拿大辩论指南，帮助自己更清楚地理解学校、比赛和长期成长路径。"],
            ].map(([title, text], index) => {
              const hrefs = ["/classes", "/classes", "/public-speaking-classes-for-kids", "/guide-to-debate-in-canada"];
              return (
                <article
                  key={title}
                  className="flex flex-col rounded-2xl border border-warm-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
                >
                  <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{title}</h3>
                  <p className="flex-1 leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{text}</p>
                  <Link
                    href={hrefs[index]}
                    className="mt-5 inline-flex text-sm font-semibold text-gold-600 underline underline-offset-4 transition-colors hover:text-gold-500"
                  >
                    继续了解
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-navy-900/30 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            GTA 学生如何在线上课
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              ["第一步：预约咨询", "我们会先了解孩子的年级、经验、自信程度和目标，再做课程建议。"],
              ["第二步：加入直播课堂", "学生在家登录 Zoom，参与讲解、实战练习、小组讨论和当堂反馈。"],
              ["第三步：根据反馈持续进步", "课后反馈与小任务帮助学生把成长延续到下一周，而不是只停留在上课当天。"],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-warm-200 bg-warm-50 p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800"
              >
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">{title}</h3>
                <p className="leading-relaxed text-charcoal/75 dark:text-navy-200 font-sans">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            <p>
              对多伦多家庭来说，一个非常现实的优势是时间利用率。孩子吃完晚饭后就能直接上课，上完课马上回到作业或休息，而不是把整个晚上花在往返途中。
            </p>
            <p>
              这种稳定性会直接影响进步速度。真正长期成长的学生，通常不是偶尔上几次“很厉害”的课，而是能持续参加、反复练习、不断收到反馈的学生。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-warm-100 py-16 dark:bg-navy-900/50 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-navy-800 dark:text-white md:text-4xl">
            我们服务的 GTA 区域
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Downtown Toronto",
              "Scarborough 与 North York",
              "Etobicoke、Vaughan、Markham",
              "Brampton 与 Mississauga",
              "Oakville、Milton 与更广泛 GTA 地区",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-warm-200 bg-white px-4 py-5 text-center text-sm font-medium text-navy-800 shadow-sm dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-center text-lg leading-relaxed text-charcoal/80 dark:text-navy-200 font-sans">
            不管你在多伦多市区、GTA 郊区，还是安省其他城市，只要家庭希望获得更系统、更长期的辩论成长路径，线上模式通常都比只找“最近的俱乐部”更实用。
          </p>
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
          <h2 className="mb-5 text-3xl font-bold text-white md:text-4xl">想为孩子找到合适的多伦多辩论课程吗？</h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/75 font-sans">
            建议先看{" "}
            <Link href="/zh/classes" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              课程级别
            </Link>
            、{" "}
            <Link href="/zh/pricing" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              价格
            </Link>
            与{" "}
            <Link href="/zh/team" className="underline underline-offset-4 transition-colors hover:text-gold-300">
              教练团队
            </Link>
            ，然后预约免费咨询。
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
              比较课程
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
