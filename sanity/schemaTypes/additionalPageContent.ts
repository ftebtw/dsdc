import { defineArrayMember, defineField, defineType } from "sanity";
import {
  localizedStringArrayField,
  localizedStringField,
  localizedTextField,
} from "./helpers";

export const additionalPageContent = defineType({
  name: "additionalPageContent",
  title: "Additional Pages Content",
  type: "document",
  liveEdit: true,
  fields: [
    defineField({
      name: "stats",
      title: "Homepage Stats",
      type: "object",
      fields: [
        localizedStringField("students", "Students Label"),
        localizedStringField("studentsValue", "Students Value"),
        localizedStringField("years", "Years Label"),
        localizedStringField("yearsValue", "Years Value"),
        localizedStringField("wscRate", "WSC Rate Label"),
        localizedStringField("wscRateValue", "WSC Rate Value"),
        localizedStringField("coaches", "Coaches Label"),
        localizedStringField("coachesValue", "Coaches Value"),
      ],
    }),
    defineField({
      name: "competitions",
      title: "Homepage Competition Section",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringArrayField("items", "Competition Badges"),
      ],
    }),
    defineField({
      name: "classesPage",
      title: "Classes Page",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("online", "Online Banner"),
        localizedStringField("debateTitle", "Debate Section Title"),
        localizedStringField("otherTitle", "Other Section Title"),
        localizedStringField("typicalClassTitle", "Typical Class Title"),
        defineField({
          name: "typicalClassItems",
          title: "Typical Class Items",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                localizedStringField("title", "Title"),
                localizedTextField("description", "Description"),
              ],
            }),
          ],
        }),
        localizedTextField("pricingNote", "Pricing Note"),
        localizedStringField("unsure", "Not Sure Prompt"),
        localizedStringField("bookCta", "Book CTA"),
        defineField({
          name: "classes",
          title: "Class Cards",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                localizedStringField("name", "Name"),
                localizedStringField("grades", "Grades"),
                localizedStringField("schedule", "Schedule"),
                defineField({
                  name: "category",
                  title: "Category",
                  type: "string",
                  options: {
                    list: [
                      { title: "Debate", value: "debate" },
                      { title: "Other", value: "other" },
                    ],
                  },
                  validation: (rule) => rule.required(),
                }),
                localizedTextField("description", "Description"),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "bookPage",
      title: "Book Page",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("expectTitle", "What to Expect Title"),
        localizedStringArrayField("expectItems", "What to Expect Items"),
        localizedStringField("scheduleOnline", "Schedule Online Heading"),
        localizedStringField("calendlyWidgetTitle", "Calendly Placeholder Title"),
        localizedStringField("calendlyWidgetSubtitle", "Calendly Placeholder Subtitle"),
        localizedStringField("calendlyPlaceholderUrl", "Calendly Placeholder URL"),
        localizedStringField("consultationDuration", "Consultation Duration"),
        localizedStringField("consultationMode", "Consultation Mode"),
        localizedStringField("formTitle", "Form Title"),
        localizedStringField("name", "Name Label"),
        localizedStringField("email", "Email Label"),
        localizedStringField("phone", "Phone Label"),
        localizedStringField("grade", "Grade Label"),
        localizedStringArrayField("gradeOptions", "Grade Options"),
        localizedStringField("heardAbout", "Heard About Label"),
        localizedStringArrayField("heardOptions", "Heard About Options"),
        localizedStringField("message", "Message Label"),
        localizedStringField("submit", "Submit Button"),
        localizedStringField("success", "Success Message"),
        localizedStringField("namePlaceholder", "Name Placeholder"),
        localizedStringField("emailPlaceholder", "Email Placeholder"),
        localizedStringField("phonePlaceholder", "Phone Placeholder"),
        localizedTextField("messagePlaceholder", "Message Placeholder"),
      ],
    }),
    defineField({
      name: "awardsPage",
      title: "Awards Page Labels",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("debateTitle", "Debate Section Title"),
        localizedStringField("wscTitle", "WSC Section Title"),
        localizedStringField("viewAll", "View All Label"),
        localizedStringField("showLess", "Show Less Label"),
        localizedStringField("moreSuffix", "More Suffix Label"),
      ],
    }),
    defineField({
      name: "blog",
      title: "Blog Labels",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("allPosts", "All Posts Label"),
        localizedStringField("relatedPosts", "Related Posts Label"),
        localizedStringField("readArticle", "Read Article Label"),
        localizedStringField("read", "Read Label"),
        localizedStringField("backToBlog", "Back to Blog Label"),
        localizedStringField("readyTitle", "Ready CTA Title"),
        localizedTextField("readySubtitle", "Ready CTA Subtitle"),
      ],
    }),
    defineField({
      name: "paymentSuccess",
      title: "Payment Success Labels",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("amountPaid", "Amount Paid Label"),
        localizedStringField("classTier", "Class Tier Label"),
        localizedStringField("receipt", "Receipt Label"),
        localizedStringField("backHome", "Back Home Label"),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Additional Pages Content" };
    },
  },
});
