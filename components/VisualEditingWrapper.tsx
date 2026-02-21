"use client";

import { VisualEditing } from "next-sanity/visual-editing";
import { usePathname } from "next/navigation";

export default function VisualEditingWrapper({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (!enabled || isStudio) return null;

  return <VisualEditing basePath="/studio" />;
}
