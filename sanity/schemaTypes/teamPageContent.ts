import { defineArrayMember, defineField, defineType } from "sanity";
import { localizedStringArrayField, localizedStringField, localizedTextField } from "./helpers";

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
        localizedStringField("founderName", "Founder Name"),
        localizedStringField("founderTitle", "Founder Title"),
        localizedTextField("founderBio", "Founder Bio"),
        localizedStringArrayField("founderKeyAchievements", "Founder Key Achievements"),
        localizedStringField("viewAwards", "View Awards"),
        localizedStringField("hideAwards", "Hide Awards"),
        localizedStringField("keyAchievements", "Key Achievements Label"),
        localizedStringField("tournament", "Tournament Label"),
        localizedStringField("year", "Year Label"),
        localizedStringField("award", "Award Label"),
        defineField({
          name: "founderAwards",
          title: "Founder Awards (Optional Override)",
          type: "array",
          description:
            "Set this to edit Rebecca's awards directly in Studio. If left empty, the site will use the built-in defaults.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                defineField({
                  name: "award",
                  title: "Award",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "tournament",
                  title: "Tournament",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "year",
                  title: "Year",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: {
                  title: "award",
                  subtitle: "tournament",
                },
              },
            }),
          ],
        }),
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
            defineField({
              name: "awards",
              title: "Awards (Optional Override)",
              type: "array",
              description:
                "Optional: add awards for this coach. If left empty, the site uses built-in defaults for matching coach names.",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [
                    defineField({
                      name: "award",
                      title: "Award",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "tournament",
                      title: "Tournament",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "year",
                      title: "Year",
                      type: "string",
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: "award",
                      subtitle: "tournament",
                    },
                  },
                }),
              ],
            }),
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
