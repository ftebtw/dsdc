"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import CoachCard from "@/components/CoachCard";
import { coachAwards } from "@/lib/coachAwards";
import { coachImages } from "@/lib/coachImages";
import AnimatedSection from "@/components/AnimatedSection";

const founderKeyAchievements = [
  "Grand Finalist — Canadian National Championships",
  "Quarterfinalist — US National Championships",
  "Top Speaker — UBC High School Debate",
  "Scholarship Recipient — University of Sydney",
];

export default function TeamPage() {
  const { t, messages } = useI18n();
  const coaches = ((messages.coaches as Array<{
    name: string;
    title: string;
    bio: string;
    image?: string;
    imageUrl?: string;
  }> | undefined) ?? []) as Array<{
    name: string;
    title: string;
    bio: string;
    image?: string;
    imageUrl?: string;
  }>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-800 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            {t("teamPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 font-sans max-w-2xl mx-auto"
          >
            {t("teamPage.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl font-serif font-bold text-navy-800 dark:text-white mb-10 text-center">
              {t("teamPage.founderTitle")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <CoachCard
              name="Rebecca Amisano"
              title={t("teamPage.founderTitle")}
              bio={t("teamPage.founderBio")}
              awards={coachAwards["Rebecca Amisano"] || []}
              image={coachImages["Rebecca Amisano"]}
              keyAchievements={founderKeyAchievements}
              index={0}
              featured
            />
          </AnimatedSection>
        </div>
      </section>

      {/* Coaching Team Grid */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coaches.map((coach, i) => (
              <CoachCard
                key={coach.name}
                name={coach.name}
                title={coach.title}
                bio={coach.bio}
                awards={coachAwards[coach.name] || []}
                image={coach.image || coach.imageUrl || coachImages[coach.name]}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
