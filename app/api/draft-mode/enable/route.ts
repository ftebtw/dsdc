import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { createClient } from "@sanity/client";
import { sanityEnv } from "@/lib/sanity/env";

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: sanityEnv.apiVersion,
  useCdn: false,
  token: sanityEnv.token,
});

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
