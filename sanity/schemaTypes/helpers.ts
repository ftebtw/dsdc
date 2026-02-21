import { defineField } from "sanity";

export function localizedStringField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "en", title: "English", type: "string" }),
      defineField({ name: "zh", title: "Chinese", type: "string" }),
    ],
    validation: (rule) => rule.required(),
  });
}

export function localizedTextField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "en", title: "English", type: "text", rows: 3 }),
      defineField({ name: "zh", title: "Chinese", type: "text", rows: 3 }),
    ],
    validation: (rule) => rule.required(),
  });
}
