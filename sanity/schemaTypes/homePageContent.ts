import { defineArrayMember, defineField, defineType } from "sanity";
import { localizedStringField, localizedTextField } from "./helpers";

export const homePageContent = defineType({
  name: "homePageContent",
  title: "Homepage Content",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        localizedStringField("headline", "Headline"),
        localizedTextField("subheadline", "Subheadline"),
        localizedStringField("cta", "Primary CTA"),
        localizedStringField("ctaSecondary", "Secondary CTA"),
        localizedStringField("scrollHint", "Scroll Hint"),
      ],
    }),
    defineField({
      name: "difference",
      title: "Difference Section",
      type: "object",
      fields: [
        localizedStringField("title", "Section Title"),
        defineField({
          name: "cards",
          title: "Cards",
          type: "object",
          fields: ["coaching", "attention", "leadership"].map((key) =>
            defineField({
              name: key,
              title: key.charAt(0).toUpperCase() + key.slice(1),
              type: "object",
              fields: [
                localizedStringField("title", "Title"),
                localizedTextField("description", "Description"),
              ],
            })
          ),
        }),
      ],
    }),
    defineField({
      name: "howItWorks",
      title: "How It Works",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        defineField({
          name: "steps",
          title: "Steps",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({ name: "step", title: "Step Number", type: "string" }),
                localizedStringField("title", "Title"),
                localizedTextField("description", "Description"),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("text", "Body"),
        localizedStringField("cta", "CTA"),
      ],
    }),
    defineField({
      name: "classesOverview",
      title: "Classes Overview",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        defineField({
          name: "publicSpeaking",
          title: "Public Speaking Card",
          type: "object",
          fields: [
            localizedStringField("title", "Title"),
            localizedTextField("description", "Description"),
          ],
        }),
        defineField({
          name: "debate",
          title: "Debate Card",
          type: "object",
          fields: [
            localizedStringField("title", "Title"),
            localizedTextField("description", "Description"),
          ],
        }),
        defineField({
          name: "wsc",
          title: "WSC Card",
          type: "object",
          fields: [
            localizedStringField("title", "Title"),
            localizedTextField("description", "Description"),
          ],
        }),
        localizedStringField("viewAll", "View All Label"),
        localizedStringField("bookCta", "Book CTA Label"),
      ],
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                localizedStringField("name", "Name"),
                localizedStringField("role", "Role"),
                localizedTextField("quote", "Quote"),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        defineField({
          name: "items",
          title: "Q&A Items",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                localizedStringField("q", "Question"),
                localizedTextField("a", "Answer"),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "finalCta",
      title: "Final CTA",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("cta", "CTA"),
        localizedStringField("phone", "Support/Contact Line"),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage Content" };
    },
  },
});
