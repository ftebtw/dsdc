import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { createClient } from "@sanity/client";
import { hasSanityConfig, sanityEnv } from "@/lib/sanity/env";
import { NextResponse } from "next/server";

function getDraftModeGetHandler() {
  if (!hasSanityConfig()) return null;

  const client = createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: false,
    token: sanityEnv.token,
  });

  return defineEnableDraftMode({
    client: client.withConfig({ token: sanityEnv.token }),
  }).GET;
}

export async function GET(request: Request) {
  const handler = getDraftModeGetHandler();
  if (!handler) {
    return NextResponse.json(
      { error: "Sanity preview environment is not configured." },
      { status: 500 }
    );
  }

  return handler(request);
}
