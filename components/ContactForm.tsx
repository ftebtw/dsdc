"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ContactForm() {
  const { t, locale } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    heardAbout: "",
    message: "",
  });

  const en = require("@/messages/en.json");
  const zh = require("@/messages/zh.json");
  const msgs = locale === "zh" ? zh : en;
  const gradeOptions = msgs.bookPage.gradeOptions as string[];
  const heardOptions = msgs.bookPage.heardOptions as string[];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder — would normally POST to an API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
      <h3 className="text-2xl font-bold text-navy-800 mb-6 font-serif">
        {t("bookPage.formTitle")}
      </h3>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-navy-800">{t("bookPage.success")}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-800 mb-1.5 font-sans">
                {t("bookPage.name")}
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("bookPage.namePlaceholder")}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg text-charcoal
                           focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none
                           transition-all font-sans"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-800 mb-1.5 font-sans">
                {t("bookPage.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("bookPage.emailPlaceholder")}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg text-charcoal
                           focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none
                           transition-all font-sans"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-navy-800 mb-1.5 font-sans">
                {t("bookPage.phone")}
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t("bookPage.phonePlaceholder")}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg text-charcoal
                           focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none
                           transition-all font-sans"
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-navy-800 mb-1.5 font-sans">
                {t("bookPage.grade")}
              </label>
              <select
                id="grade"
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg text-charcoal
                           focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none
                           transition-all font-sans"
              >
                <option value="">{t("bookPage.grade")}</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="heardAbout" className="block text-sm font-medium text-navy-800 mb-1.5 font-sans">
                {t("bookPage.heardAbout")}
              </label>
              <select
                id="heardAbout"
                value={formData.heardAbout}
                onChange={(e) => setFormData({ ...formData, heardAbout: e.target.value })}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg text-charcoal
                           focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none
                           transition-all font-sans"
              >
                <option value="">{t("bookPage.heardAbout")}</option>
                {heardOptions.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-navy-800 mb-1.5 font-sans">
                {t("bookPage.message")}
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t("bookPage.messagePlaceholder")}
                className="w-full px-4 py-3 border border-warm-300 rounded-lg text-charcoal
                           focus:ring-2 focus:ring-gold-400 focus:border-gold-400 outline-none
                           transition-all resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-gold-400 text-navy-900 font-semibold rounded-lg
                         hover:bg-gold-300 transition-all duration-200 shadow-md hover:shadow-lg
                         flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t("bookPage.submit")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
