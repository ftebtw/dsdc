import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structuredData";
import ClassesPageClient from "./ClassesPageClient";

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

const classesCourseSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "Course",
      name: "Novice Debate Class (Grades 4-6)",
      description:
        "An introductory debate and public speaking class for younger students. Build confidence through fundamentals of speech and debate.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      deliveryMode: "online",
      position: 1,
    },
    {
      "@type": "Course",
      name: "Junior Debate Class (Grades 7-9)",
      description:
        "Build competitive debate skills with challenging topics in International Relations, Law, Philosophy, and Economics.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      deliveryMode: "online",
      position: 2,
    },
    {
      "@type": "Course",
      name: "Senior Debate Class (Grades 10-12)",
      description:
        "Rigorous practice in British Parliamentary, CNDF, and World Schools debate formats with advanced lectures.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      deliveryMode: "online",
      position: 3,
    },
    {
      "@type": "Course",
      name: "Advanced Competitive Debate (Grades 10-12)",
      description:
        "Elite program led by world-renowned university debaters for students committed to competitive debate.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      deliveryMode: "online",
      position: 4,
    },
    {
      "@type": "Course",
      name: "World Scholar's Cup Preparation (Grades 4-12)",
      description:
        "Full WSC preparation with 100% qualification rate since 2020 - from regionals to the Tournament of Champions at Yale.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      deliveryMode: "online",
      position: 5,
    },
    {
      "@type": "Course",
      name: "Public Speaking (Grades 4-9)",
      description:
        "Training in impromptu, persuasive, interpretive, and parliamentary formats. Preparation for BC speech provincials.",
      provider: {
        "@type": "EducationalOrganization",
        name: "DSDC",
        url: "https://dsdc.ca",
      },
      deliveryMode: "online",
      position: 6,
    },
  ],
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
