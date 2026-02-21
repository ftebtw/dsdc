import { defineArrayMember, defineField, defineType } from "sanity";
import { localizedStringField, localizedTextField } from "./helpers";

export const teamPageContent = defineType({
  name: "teamPageContent",
  title: "Team Page Content",
  type: "document",
  liveEdit: true,
  fields: [
    defineField({
      name: "teamPage",
      title: "Team Page Labels",
      type: "object",
      fields: [
        localizedStringField("title", "Title"),
        localizedTextField("subtitle", "Subtitle"),
        localizedStringField("founderTitle", "Founder Title"),
        localizedTextField("founderBio", "Founder Bio"),
        localizedStringField("viewAwards", "View Awards"),
        localizedStringField("hideAwards", "Hide Awards"),
        localizedStringField("keyAchievements", "Key Achievements Label"),
        localizedStringField("tournament", "Tournament Label"),
        localizedStringField("year", "Year Label"),
        localizedStringField("award", "Award Label"),
      ],
    }),
    defineField({
      name: "coaches",
      title: "Coaches",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
            localizedStringField("title", "Title"),
            localizedTextField("bio", "Bio"),
            defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Team Page Content" };
    },
  },
});
