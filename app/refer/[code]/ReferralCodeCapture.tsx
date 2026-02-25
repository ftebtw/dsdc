"use client";

import { useEffect } from "react";

export default function ReferralCodeCapture({ code }: { code: string }) {
  useEffect(() => {
    try {
      localStorage.setItem("dsdc-referral-code", code);
    } catch {
      // ignore storage errors in private mode
    }
  }, [code]);

  return null;
}

