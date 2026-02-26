"use client";

import { useEffect } from "react";

export default function ReferralCodeCapture({ code }: { code: string }) {
  useEffect(() => {
    try {
      localStorage.setItem("dsdc-referral-code", code);
    } catch (err) {
      console.error("[referral-code-capture] localStorage write failed", err);
    }
  }, [code]);

  return null;
}

