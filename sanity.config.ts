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
import { defineDocuments } from "sanity/presentation";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const locations = {
  homePageContent: { locations: [{ title: "Homepage", href: "/" }] },
  pricingPageContent: { locations: [{ title: "Pricing", href: "/pricing" }] },
  teamPageContent: { locations: [{ title: "Team", href: "/team" }] },
  siteSettings: { locations: [{ title: "Site", href: "/" }] },
};

export const mainDocuments = defineDocuments([
  { route: "/", filter: `_type == "homePageContent"` },
  { route: "/pricing", filter: `_type == "pricingPageContent"` },
  { route: "/team", filter: `_type == "teamPageContent"` },
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
                S.documentTypeList("homePageContent")
                  .title("Homepage Content")
                  .filter('_type == "homePageContent"')
              ),
            S.listItem()
              .title("Pricing Page")
              .icon(DocumentIcon)
              .child(
                S.documentTypeList("pricingPageContent")
                  .title("Pricing Page Content")
                  .filter('_type == "pricingPageContent"')
              ),
            S.listItem()
              .title("Team Page")
              .icon(UsersIcon)
              .child(
                S.documentTypeList("teamPageContent")
                  .title("Team Page Content")
                  .filter('_type == "teamPageContent"')
              ),
            S.divider(),
            S.listItem()
              .title("Site Settings")
              .icon(CogIcon)
              .child(
                S.documentTypeList("siteSettings")
                  .title("Site Settings")
                  .filter('_type == "siteSettings"')
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
});
