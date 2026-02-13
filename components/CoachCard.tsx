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
      <div className="bg-warm-100 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Photo — full height on desktop */}
          <div className="md:w-1/3 h-80 md:h-auto relative bg-navy-100">
            {image ? (
              <img
                src={image}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center">
                <span className="text-5xl font-bold text-gold-400">{initials}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-navy-800 mb-2 font-serif">
              {name}
            </h3>
            <p className="text-gold-500 font-medium mb-6 uppercase tracking-wider text-sm font-sans">
              {title}
            </p>
            <p className="text-charcoal/70 text-lg leading-relaxed mb-8 font-sans">
              {bio}
            </p>

            {/* Key Achievements box */}
            {keyAchievements && keyAchievements.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-warm-200">
                <h4 className="flex items-center text-lg font-semibold text-navy-800 mb-4 font-serif">
                  <Trophy className="w-5 h-5 mr-2 text-gold-400" />
                  {t("teamPage.keyAchievements")}
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {keyAchievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-charcoal/70 font-sans"
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
                  className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-warm-200
                             hover:bg-warm-50 transition-colors text-sm font-semibold text-navy-800"
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
                            className="flex items-start text-sm text-charcoal/60 font-sans"
                          >
                            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-1.5 mr-2.5 shrink-0" />
                            <span>
                              <span className="font-medium text-charcoal/80">{award.award}</span>
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
      className="bg-white rounded-xl shadow-lg border border-warm-200 overflow-hidden flex flex-col
                 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo */}
      <div className="h-64 relative bg-navy-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
            <span className="text-3xl font-bold text-navy-400">{initials}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-navy-800 font-serif">{name}</h3>
        <p className="text-gold-500 text-sm font-medium mb-4 uppercase tracking-wider font-sans">
          {title}
        </p>
        <p className="text-charcoal/60 text-sm leading-relaxed mb-6 flex-grow font-sans">
          {bio}
        </p>

        {/* Awards toggle bar */}
        {awards.length > 0 && (
          <>
            <button
              onClick={() => setShowAwards(!showAwards)}
              className="flex items-center justify-between w-full p-3 bg-warm-50 rounded-lg
                         hover:bg-warm-100 transition-colors text-sm font-semibold text-navy-800"
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
                        className="flex items-start text-xs text-charcoal/50 font-sans"
                      >
                        <span className="w-1.5 h-1.5 bg-gold-400 rounded-full mt-1 mr-2 shrink-0" />
                        <span>
                          <span className="font-medium text-charcoal/70">{award.award}</span>
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
