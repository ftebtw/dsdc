import { defineField, defineType } from "sanity";
import { localizedStringField } from "./helpers";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "nav",
      title: "Navigation",
      type: "object",
      fields: [
        localizedStringField("home", "Home"),
        localizedStringField("team", "Team"),
        localizedStringField("classes", "Classes"),
        localizedStringField("awards", "Awards"),
        localizedStringField("blog", "Blog"),
        localizedStringField("pricing", "Pricing"),
        localizedStringField("book", "Book CTA"),
        localizedStringField("langToggle", "Language Toggle Label"),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        localizedStringField("tagline", "Tagline"),
        localizedStringField("quickLinks", "Quick Links Label"),
        localizedStringField("contact", "Contact Label"),
        localizedStringField("social", "Social Label"),
        localizedStringField("copyright", "Copyright"),
        defineField({ name: "companyEmail", title: "Company Email", type: "string" }),
        defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
        defineField({ name: "linkedinUrl", title: "LinkedIn URL", type: "url" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "nav.home.en",
    },
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
