import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import {
  HomeIcon,
  DocumentIcon,
  UsersIcon,
  CogIcon,
} from "@sanity/icons";
import { defineDocuments, defineLocations } from "sanity/presentation";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

const singletonTypes = new Set([
  "homePageContent",
  "pricingPageContent",
  "teamPageContent",
  "siteSettings",
  "additionalPageContent",
]);

export const locations = {
  homePageContent: defineLocations({
    select: { _type: "_type" },
    resolve: () => ({ locations: [{ title: "Homepage", href: "/" }] }),
  }),
  pricingPageContent: defineLocations({
    select: { _type: "_type" },
    resolve: () => ({ locations: [{ title: "Pricing", href: "/pricing" }] }),
  }),
  teamPageContent: defineLocations({
    select: { _type: "_type" },
    resolve: () => ({ locations: [{ title: "Team", href: "/team" }] }),
  }),
  siteSettings: defineLocations({
    select: { _type: "_type" },
    resolve: () => ({
      locations: [
        { title: "Homepage", href: "/" },
        { title: "Pricing", href: "/pricing" },
        { title: "Team", href: "/team" },
        { title: "Classes", href: "/classes" },
        { title: "Awards", href: "/awards" },
        { title: "Blog", href: "/blog" },
        { title: "Book", href: "/book" },
      ],
    }),
  }),
  additionalPageContent: defineLocations({
    select: { _type: "_type" },
    resolve: () => ({
      locations: [
        { title: "Homepage", href: "/" },
        { title: "Classes", href: "/classes" },
        { title: "Book", href: "/book" },
        { title: "Awards", href: "/awards" },
        { title: "Blog", href: "/blog" },
        { title: "Payment Success", href: "/payment/success" },
      ],
    }),
  }),
};

// Resolve presentation documents to canonical singleton IDs.
export const mainDocuments = defineDocuments([
  { route: "/", filter: '_type == "homePageContent" && _id == "homePageContent"' },
  { route: "/pricing", filter: '_type == "pricingPageContent" && _id == "pricingPageContent"' },
  { route: "/team", filter: '_type == "teamPageContent" && _id == "teamPageContent"' },
  { route: "/classes", filter: '_type == "additionalPageContent" && _id == "additionalPageContent"' },
  { route: "/book", filter: '_type == "additionalPageContent" && _id == "additionalPageContent"' },
  { route: "/awards", filter: '_type == "additionalPageContent" && _id == "additionalPageContent"' },
  { route: "/blog", filter: '_type == "additionalPageContent" && _id == "additionalPageContent"' },
]);

export default defineConfig({
  name: "default",
  title: "DSDC CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    presentationTool({
      name: "presentation",
      title: "Preview",
      resolve: { locations, mainDocuments },
      previewUrl: {
        initial: `${previewOrigin}/`,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      allowOrigins: [previewOrigin, "http://localhost:3000", "http://localhost:*"],
    }),
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Homepage")
              .icon(HomeIcon)
              .child(
                S.document()
                  .schemaType("homePageContent")
                  .documentId("homePageContent")
                  .title("Homepage Content")
              ),
            S.listItem()
              .title("Pricing Page")
              .icon(DocumentIcon)
              .child(
                S.document()
                  .schemaType("pricingPageContent")
                  .documentId("pricingPageContent")
                  .title("Pricing Page Content")
              ),
            S.listItem()
              .title("Team Page")
              .icon(UsersIcon)
              .child(
                S.document()
                  .schemaType("teamPageContent")
                  .documentId("teamPageContent")
                  .title("Team Page Content")
              ),
            S.listItem()
              .title("Additional Pages")
              .icon(DocumentIcon)
              .child(
                S.document()
                  .schemaType("additionalPageContent")
                  .documentId("additionalPageContent")
                  .title("Additional Pages Content")
              ),
            S.divider(),
            S.listItem()
              .title("Site Settings")
              .icon(CogIcon)
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Site Settings")
              ),
          ]),
    }),
  ],
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type !== "global") return prev;
      return prev.filter((templateItem) => !singletonTypes.has(templateItem.templateId));
    },
    actions: (prev, context) => {
      if (!singletonTypes.has(context.schemaType)) return prev;
      return prev.filter((actionItem) => actionItem.action !== "duplicate");
    },
  },
  schema: {
    types: schemaTypes,
  },
});
