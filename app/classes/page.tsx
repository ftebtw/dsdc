import ClassesPageClient from "./ClassesPageClient";

export const revalidate = 60;

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

export default function ClassesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(classesCourseSchema) }}
      />
      <ClassesPageClient />
    </>
  );
}
