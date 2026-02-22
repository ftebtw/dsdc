import { type SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { homePageContent } from "./homePageContent";
import { pricingPageContent } from "./pricingPageContent";
import { teamPageContent } from "./teamPageContent";
import { additionalPageContent } from "./additionalPageContent";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  homePageContent,
  pricingPageContent,
  teamPageContent,
  additionalPageContent,
];
