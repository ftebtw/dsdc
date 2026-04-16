"use client";

import { useEffect, useRef } from "react";
import { trackViewContent } from "@/lib/analytics";

type MetaViewContentTrackerProps = {
  contentName: string;
  contentCategory: string;
};

export default function MetaViewContentTracker({
  contentName,
  contentCategory,
}: MetaViewContentTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    let attempts = 0;
    let timeoutId: number | undefined;

    const sendViewContent = () => {
      const didTrack = trackViewContent({
        content_name: contentName,
        content_category: contentCategory,
      });

      if (!didTrack && attempts < 8) {
        attempts += 1;
        timeoutId = window.setTimeout(sendViewContent, 250);
      }
    };

    sendViewContent();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [contentCategory, contentName]);

  return null;
}
