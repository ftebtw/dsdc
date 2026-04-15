import JsonLd from "@/components/JsonLd";
import { SITE_URL, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";
import ClassesPageClient from "./ClassesPageClient";

const courseProvider = {
  "@type": "EducationalOrganization",
  "@id": `${SITE_URL}/#organization`,
  name: "DSDC",
  url: SITE_URL,
} as const;

type ClassCourse = {
  name: string;
  description: string;
  url: string;
  price: number;
  suggestedMinAge: number;
  suggestedMaxAge: number;
  educationalLevel: string;
};

function buildCourseSchema(course: ClassCourse, position: number) {
  return {
    "@type": "Course",
    position,
    name: course.name,
    description: course.description,
    url: course.url,
    provider: courseProvider,
    inLanguage: "en",
    availableLanguage: ["en", "zh"],
    educationalLevel: course.educationalLevel,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      suggestedMinAge: course.suggestedMinAge,
      suggestedMaxAge: course.suggestedMaxAge,
    },
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "Online",
        courseWorkload: "PT1H30M",
        instructor: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
    offers: {
      "@type": "Offer",
      category: "Paid",
      priceCurrency: "CAD",
      price: course.price.toString(),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing`,
    },
  };
}

export const revalidate = 60;

const classesFaqItems = [
  {
    question: "What ages are your debate classes for kids designed for?",
    answer:
      "DSDC offers debate classes for kids in Grades 4 through 12, plus advanced options for competitive high school students and university students who want high-level coaching.",
  },
  {
    question: "Do you offer both online debate classes and public speaking classes?",
    answer:
      "Yes. Families can choose from online debate classes, public speaking classes, World Scholar's Cup coaching, and advanced competitive debate programs depending on age and experience.",
  },
  {
    question: "What does a typical public speaking course or debate class include?",
    answer:
      "Most classes include a warm-up, a lesson on a current topic or communication skill, structured speaking or debate practice, and personalized written feedback from the coach after class.",
  },
  {
    question: "Are these classes good for shy beginners?",
    answer:
      "Absolutely. Many students start with no experience. Our beginner-friendly classes are designed to help shy students build confidence gradually through guided practice and supportive feedback.",
  },
  {
    question: "How is DSDC different from a short debate camp?",
    answer:
      "A debate camp can be a great introduction, but weekly classes usually create stronger long-term growth because students practice consistently, receive feedback over time, and progress through clear levels.",
  },
  {
    question: "How do we choose the right class and get started?",
    answer:
      "The best first step is to compare the class levels or book a free consultation. We recommend the right class based on your child's grade, confidence level, and academic goals.",
  },
  {
    question: "How much homework should families expect each week?",
    answer:
      "Homework is usually short and focused, such as a case outline, research notes, or a speaking exercise that reinforces the week's lesson. It is designed to support progress without overwhelming students.",
  },
  {
    question: "How do you measure progress in an online debate class?",
    answer:
      "We track progress through live class performance, written feedback, coach observation, and longer-term growth in confidence, structure, and argument quality. Families usually notice meaningful improvement over the course of a term.",
  },
];

const classCourses: ClassCourse[] = [
  {
    name: "Novice Debate Class (Grades 4-6)",
    description:
      "An introductory debate and public speaking class for younger students. Build confidence through fundamentals of speech and debate.",
    url: `${SITE_URL}/debate-classes-for-kids`,
    price: 720,
    suggestedMinAge: 9,
    suggestedMaxAge: 12,
    educationalLevel: "Elementary School",
  },
  {
    name: "Junior Debate Class (Grades 7-9)",
    description:
      "Build competitive debate skills with challenging topics in International Relations, Law, Philosophy, and Economics.",
    url: `${SITE_URL}/classes`,
    price: 720,
    suggestedMinAge: 12,
    suggestedMaxAge: 15,
    educationalLevel: "Middle School",
  },
  {
    name: "Senior Debate Class (Grades 10-12)",
    description:
      "Rigorous practice in British Parliamentary, CNDF, and World Schools debate formats with advanced lectures.",
    url: `${SITE_URL}/classes`,
    price: 720,
    suggestedMinAge: 15,
    suggestedMaxAge: 18,
    educationalLevel: "High School",
  },
  {
    name: "Advanced Competitive Debate (Grades 10-12)",
    description:
      "Elite program led by world-renowned university debaters for students committed to competitive debate.",
    url: `${SITE_URL}/classes`,
    price: 1200,
    suggestedMinAge: 15,
    suggestedMaxAge: 18,
    educationalLevel: "High School",
  },
  {
    name: "World Scholar's Cup Preparation (Grades 4-12)",
    description:
      "Full WSC preparation with 100% qualification rate since 2020 - from regionals to the Tournament of Champions at Yale.",
    url: `${SITE_URL}/world-scholars-cup-coaching`,
    price: 960,
    suggestedMinAge: 9,
    suggestedMaxAge: 18,
    educationalLevel: "Elementary School, Middle School, High School",
  },
  {
    name: "Public Speaking (Grades 4-9)",
    description:
      "Training in impromptu, persuasive, interpretive, and parliamentary formats. Preparation for BC speech provincials.",
    url: `${SITE_URL}/public-speaking-classes-for-kids`,
    price: 720,
    suggestedMinAge: 9,
    suggestedMaxAge: 15,
    educationalLevel: "Elementary School, Middle School",
  },
];

const classesCourseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: classCourses.map((course, index) => buildCourseSchema(course, index + 1)),
};

const classesFaqSchema = buildFaqSchema(classesFaqItems);
const classesBreadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Classes", path: "/classes" },
]);

export default function ClassesPage() {
  return (
    <>
      <JsonLd id="classes-course-schema" data={classesCourseSchema} />
      <JsonLd id="classes-faq-schema" data={classesFaqSchema} />
      <JsonLd id="classes-breadcrumb-schema" data={classesBreadcrumbSchema} />
      <ClassesPageClient />
    </>
  );
}
