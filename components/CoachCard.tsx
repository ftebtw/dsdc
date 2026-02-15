"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Award } from "@/lib/coachAwards";

interface CoachCardProps {
  name: string;
  title: string;
  bio: string;
  awards: Award[];
  index: number;
  featured?: boolean;
  image?: string;
  keyAchievements?: string[];
}

export default function CoachCard({
  name,
  title,
  bio,
  awards,
  index,
  featured = false,
  image,
  keyAchievements,
}: CoachCardProps) {
  const [showAwards, setShowAwards] = useState(false);
  const { t } = useI18n();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  /* ───────── FOUNDER CARD ───────── */
  if (featured) {
    return (
      <div className="bg-warm-100 dark:bg-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Photo — full height on desktop */}
          <div className="md:w-2/5 aspect-[3/4] md:aspect-auto md:min-h-[500px] relative bg-navy-100 dark:bg-navy-900">
            {image ? (
              <img
                src={image}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
                <span className="text-5xl font-bold text-gold-400">{initials}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="md:w-3/5 p-5 sm:p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-navy-800 dark:text-white mb-2 font-serif">
              {name}
            </h3>
            <p className="text-gold-500 dark:text-gold-400 font-medium mb-6 uppercase tracking-wider text-sm font-sans">
              {title}
            </p>
            <p className="text-charcoal/70 dark:text-navy-200 text-lg leading-relaxed mb-8 font-sans">
              {bio}
            </p>

            {/* Key Achievements box */}
            {keyAchievements && keyAchievements.length > 0 && (
              <div className="bg-white dark:bg-navy-900 p-4 sm:p-6 rounded-xl border border-warm-200 dark:border-navy-700">
                <h4 className="flex items-center text-lg font-semibold text-navy-800 dark:text-white mb-4 font-serif">
                  <Trophy className="w-5 h-5 mr-2 text-gold-400" />
                  {t("teamPage.keyAchievements")}
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keyAchievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-charcoal/70 dark:text-navy-200 font-sans"
                    >
                      <span className="w-2 h-2 bg-gold-400 rounded-full mt-1.5 mr-2.5 shrink-0" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full awards toggle */}
            {awards.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAwards(!showAwards)}
                  className="flex items-center justify-between w-full p-3 bg-white dark:bg-navy-900 rounded-lg border border-warm-200 dark:border-navy-700
                             hover:bg-warm-50 dark:hover:bg-navy-700 transition-colors text-sm font-semibold text-navy-800 dark:text-navy-100"
                >
                  <span>{showAwards ? t("teamPage.hideAwards") : t("teamPage.viewAwards")}</span>
                  {showAwards ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence>
                  {showAwards && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-4 space-y-2 pb-2">
                        {awards.map((award, j) => (
                          <li
                            key={j}
                            className="flex items-start text-sm text-charcoal/60 dark:text-navy-300 font-sans"
                          >
                            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-1.5 mr-2.5 shrink-0" />
                            <span>
                              <span className="font-medium text-charcoal/80 dark:text-navy-200">{award.award}</span>
                              {" — "}
                              {award.tournament} ({award.year})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ───────── REGULAR COACH CARD ───────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-warm-200 dark:border-navy-700 overflow-hidden flex flex-col
                 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo */}
      <div className="aspect-[3/4] relative bg-navy-100 dark:bg-navy-900 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-navy-400 dark:text-navy-300">{initials}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-navy-800 dark:text-white font-serif">{name}</h3>
        <p className="text-gold-500 dark:text-gold-400 text-sm font-medium mb-4 uppercase tracking-wider font-sans">
          {title}
        </p>
        <p className="text-charcoal/60 dark:text-navy-200 text-sm leading-relaxed mb-6 flex-grow font-sans">
          {bio}
        </p>

        {/* Awards toggle bar */}
        {awards.length > 0 && (
          <>
            <button
              onClick={() => setShowAwards(!showAwards)}
              className="flex items-center justify-between w-full p-3 bg-warm-50 dark:bg-navy-900 rounded-lg
                         hover:bg-warm-100 dark:hover:bg-navy-700 transition-colors text-sm font-semibold text-navy-800 dark:text-navy-100"
            >
              <span>{showAwards ? t("teamPage.hideAwards") : t("teamPage.viewAwards")}</span>
              {showAwards ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {showAwards && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="mt-4 space-y-2 pb-2">
                    {awards.map((award, j) => (
                      <li
                        key={j}
                        className="flex items-start text-xs text-charcoal/50 dark:text-navy-300 font-sans"
                      >
                        <span className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-1 mr-2 shrink-0" />
                        <span>
                          <span className="font-medium text-charcoal/70 dark:text-navy-200">{award.award}</span>
                          {" — "}
                          {award.tournament} ({award.year})
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
