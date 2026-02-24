"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UserInfo {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;
      setUser({
        id: session.user.id,
        email: session.user.email || "",
        displayName: profile?.display_name || session.user.email?.split("@")[0] || "User",
        role: profile?.role || "student",
      });
      setLoading(false);
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
