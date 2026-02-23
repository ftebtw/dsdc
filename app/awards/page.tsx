"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { translateAwardLabel } from "@/lib/awardLabels";
import AnimatedSection from "@/components/AnimatedSection";

interface StudentAward {
  result: string;
  tournament: string;
  year: string;
}

interface StudentData {
  name: string;
  awards: StudentAward[];
}

const debateStudents: StudentData[] = [
  {
    name: "Emily C.",
    awards: [
      { result: "Finalist", tournament: "Summer Bonanza (Open)", year: "2024" },
      { result: "Semi-Finalist", tournament: "UBC Fall High School Tournament (Senior)", year: "2024" },
      { result: "Champion", tournament: "Canada Cup (Open)", year: "2023" },
      { result: "Finalist", tournament: "UBC Fall High School Tournament (Senior)", year: "2023" },
      { result: "Quarterfinalist", tournament: "Doxbridge Worlds Schools Debate Championships", year: "2023" },
      { result: "Octofinalist", tournament: "37th Annual Stanford Invitational (Varsity)", year: "2023" },
      { result: "Finalist", tournament: "SFU Worlds Schools Debate Championships (Open)", year: "2023" },
      { result: "Champion", tournament: "SFU Worlds Schools Debate Championships (Open)", year: "2022" },
      { result: "Quarterfinalist", tournament: "Paris Worlds Schools Debate Championships (Open)", year: "2022" },
    ],
  },
  {
    name: "Angela M.",
    awards: [
      { result: "Junior Champion", tournament: "Team Canada Fall World Schools Debate Championships", year: "2026" },
      { result: "2nd Place Junior Speaker", tournament: "Team Canada Fall World Schools Debate Championships", year: "2026" },
      { result: "Junior Champion", tournament: "Hart House Winter Open", year: "2026" },
      { result: "Junior Grand Finalist", tournament: "University of British Columbia Fall High School Tournament", year: "2026" },
      { result: "Champion Junior Speaker", tournament: "University of British Columbia Fall High School Tournament", year: "2026" },
      { result: "Junior Champion", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "5th Place Junior Speaker", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Grand Finalist", tournament: "Tri City Fall Tournament", year: "2026" },
      { result: "3rd Place Speaker", tournament: "Tri City Fall Tournament", year: "2026" },
      { result: "Champion", tournament: "Pacific Cup (Open)", year: "2025" },
      { result: "Champion", tournament: "Dragons Bowl Tournament (Junior)", year: "2024" },
      { result: "Top Speaker", tournament: "Dragons Bowl Tournament (Junior)", year: "2024" },
      { result: "Champion", tournament: "Meadowridge Spring Tournament (Junior)", year: "2024" },
      { result: "Semifinalist", tournament: "Meadowridge Fall Tournament (Junior)", year: "2024" },
      { result: "Quarterfinalist", tournament: "Tri-City Tournament (Open)", year: "2024" },
    ],
  },
  {
    name: "Catherine W.",
    awards: [
      { result: "Top Speaker", tournament: "US Nationals Debate Qualifier", year: "2024" },
      { result: "Top Speaker", tournament: "UBC Spring High School Tournament (Senior)", year: "2024" },
      { result: "Top Speaker", tournament: "Lower Mainland South Regionals (Senior)", year: "2024" },
      { result: "Quarterfinalist", tournament: "British Parliamentary Nationals (Senior)", year: "2023" },
      { result: "Finalist", tournament: "British Parliamentary BC Provincials", year: "2023" },
      { result: "3rd Place", tournament: "Law Foundation Cup (BC Provincials)", year: "2023" },
      { result: "Champion", tournament: "SFU Worlds Debate Tournament", year: "2022" },
      { result: "Top Debater", tournament: "Junior Public Speaking Nationals", year: "2022" },
    ],
  },
  {
    name: "Akash K.",
    awards: [
      { result: "Champion Senior Speaker", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "3rd Place Senior Team", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Senior Provincial Qualifier", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Champion", tournament: "Meadowridge Tournament", year: "2024" },
      { result: "Champion", tournament: "Dragons Bowl Tournament (Senior)", year: "2024" },
      { result: "Champion", tournament: "Lower Mainland East Regionals", year: "2023" },
      { result: "3rd Speaker", tournament: "UBC Fall Tournament (Senior)", year: "2024" },
      { result: "5th Place", tournament: "Senior BP Provincials", year: "2024" },
    ],
  },
  {
    name: "Ryland C.",
    awards: [
      { result: "Senior Grand Finalist", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "9th Place Speaker", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Senior Provincial Qualifier", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Champion", tournament: "Pacific Cup (Open)", year: "2025" },
      { result: "Champion", tournament: "Dragons Bowl Tournament (Junior)", year: "2024" },
      { result: "Top Speaker", tournament: "Dragons Bowl Tournament (Junior)", year: "2024" },
      { result: "Quarterfinalist", tournament: "Tri-City Tournament (Open)", year: "2024" },
    ],
  },
  {
    name: "Ruonan Z.",
    awards: [
      { result: "Champion", tournament: "Canadian Cup Debate Championships", year: "2023" },
      { result: "1st Place (Prelim)", tournament: "University of Michigan Debate", year: "2023" },
      { result: "Semi-Finalist", tournament: "Georgetown Fall Debate", year: "2023" },
      { result: "Best Delegate", tournament: "Harvard Model United Nations", year: "2023" },
    ],
  },
  {
    name: "Jessie Z.",
    awards: [
      { result: "Junior Champion", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "2nd Place Junior Speaker", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Junior Champion", tournament: "Hart House Winter Open", year: "2026" },
    ],
  },
  {
    name: "Lucas X.",
    awards: [
      { result: "Senior Grand Finalist", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "2nd Place Senior Speaker", tournament: "Lower Mainland East Regionals", year: "2026" },
      { result: "Provincial Qualifier", tournament: "Lower Mainland East Regionals", year: "2026" },
    ],
  },
  {
    name: "Finn L.",
    awards: [
      { result: "Quarterfinalist", tournament: "Canadian National Cup (Junior)", year: "2021" },
      { result: "Finalist", tournament: "BC Provincial Cup (Junior)", year: "2021" },
      { result: "Champion", tournament: "Lower Mainland East Regionals (Junior)", year: "2020" },
    ],
  },
  {
    name: "Colin Y.",
    awards: [
      { result: "4th Place Junior Team", tournament: "Lower Mainland South Regionals", year: "2026" },
      { result: "Provincial Qualifier", tournament: "Lower Mainland South Regionals", year: "2026" },
    ],
  },
  {
    name: "Myreen R.",
    awards: [
      { result: "Champion", tournament: "Meadowridge Spring Tournament (Junior)", year: "2024" },
      { result: "Semifinalist", tournament: "Meadowridge Fall Tournament (Junior)", year: "2024" },
    ],
  },
  {
    name: "Sumreen K.",
    awards: [{ result: "8th Place Senior Speaker", tournament: "Lower Mainland East Regionals", year: "2026" }],
  },
  {
    name: "James H.",
    awards: [
      { result: "Champion Junior Novice Speaker", tournament: "Lower Mainland East Regionals", year: "2026" },
    ],
  },
];

interface WscRound {
  name: string;
  year: string;
  awards: string[];
}

const wscRounds: WscRound[] = [
  {
    name: "2023 Tournament of Champions",
    year: "2023",
    awards: [
      "2nd Place — North American Team",
      "2nd Place — Team Challenge",
      "3rd Place — North American Team",
    ],
  },
  {
    name: "2023 Global Round",
    year: "2023",
    awards: [
      "1st Place — Team Challenge",
      "1st Place — Team Debate",
      "1st Place — Sr Writing Scholars",
      "1st Place — Tournament of Champions Qualifier",
      "Tournament of Champions Qualifiers — All Teams",
    ],
  },
  {
    name: "2023 Vancouver Regional Round",
    year: "2023",
    awards: [
      "1st Place — Team Challenge",
      "3rd Place — Sr Team Challenge",
      "3rd Place — Team Writing",
      "2nd Place — Champion Scholars",
      "1st Place — Team Qualifiers",
      "Global Qualifiers — All Teams",
    ],
  },
  {
    name: "2022 Global Round",
    year: "2022",
    awards: [
      "1st Place — Team Challenge",
      "1st Place — Debate Champion",
      "1st Place — Team Bowl",
      "3rd Place — Team Debate",
      "Tournament of Champions Qualifiers — All Teams",
    ],
  },
  {
    name: "2022 Vancouver Regional Round",
    year: "2022",
    awards: [
      "1st Place — Sr Writing Champion",
      "1st Place — Sr Scholars Champion",
      "1st Place — Debate Champion",
      "1st Place — Team Challenge",
      "Global Qualifiers — All Teams",
    ],
  },
];

function StudentCard({ student }: { student: StudentData }) {
  const { t, locale } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? student.awards : student.awards.slice(0, 3);

  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-warm-200 dark:border-navy-700 p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-navy-600 dark:text-navy-200">{student.name.charAt(0)}</span>
        </div>
        <h3 className="text-lg font-bold text-navy-800 dark:text-white font-serif">{student.name}</h3>
      </div>
      <ul className="space-y-2">
        {shown.map((award, i) => (
          <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm font-sans">
            <span
              className={`shrink-0 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                award.result.includes("Champion") || award.result === "1st Place" || award.result.includes("Top Speaker") || award.result.includes("Best Delegate")
                  ? "bg-gold-50 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300"
                  : "bg-navy-50 dark:bg-navy-700 text-navy-600 dark:text-navy-200"
              }`}
            >
              {translateAwardLabel(award.result, locale)}
            </span>
            <span className="text-charcoal/60 dark:text-navy-300">
              {award.tournament} <span className="text-charcoal/40 dark:text-navy-400">({award.year})</span>
            </span>
          </li>
        ))}
      </ul>
      {student.awards.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-semibold text-navy-700 dark:text-navy-200 hover:text-gold-500 dark:hover:text-gold-400 transition-colors"
        >
          {expanded ? t("awardsPage.showLess") : `+${student.awards.length - 3} ${t("awardsPage.moreSuffix")}`}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

export default function AwardsPage() {
  const { t, locale } = useI18n();

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-navy-800 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Trophy className="w-10 h-10 text-gold-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            {t("awardsPage.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 font-sans max-w-2xl mx-auto"
          >
            {t("awardsPage.subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Debate & Public Speaking Awards */}
      <section className="py-16 md:py-24 bg-warm-100 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {t("awardsPage.debateTitle")}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debateStudents.map((student, i) => (
              <AnimatedSection key={student.name} delay={(i % 3) * 0.1}>
                <StudentCard student={student} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* World Scholar's Cup Awards */}
      <section className="py-16 md:py-24 bg-white dark:bg-navy-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-800 dark:text-white">
              {t("awardsPage.wscTitle")}
            </h2>
          </AnimatedSection>

          <div className="space-y-6">
            {wscRounds.map((round, i) => (
              <AnimatedSection key={round.name} delay={i * 0.1}>
                <div className="bg-warm-50 dark:bg-navy-800 rounded-xl border border-warm-200 dark:border-navy-700 p-4 sm:p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Medal className="w-6 h-6 text-gold-400 dark:text-gold-500" />
                    <h3 className="text-xl font-bold text-navy-800 dark:text-white font-serif">{round.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {round.awards.map((award, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm font-sans">
                        <span className="w-2 h-2 bg-gold-400 rounded-full mt-1.5 shrink-0" />
                        <span className="text-charcoal/70 dark:text-navy-200">
                          {translateAwardLabel(award, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
