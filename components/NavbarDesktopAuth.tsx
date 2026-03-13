"use client";

import NavDropdown from "./NavDropdown";
import { useUser } from "@/lib/hooks/useUser";

export default function NavbarDesktopAuth({
  navSolid,
}: {
  navSolid: boolean;
}) {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-warm-200 dark:bg-navy-700" />;
  }

  return <NavDropdown user={user} variant={navSolid ? "dark" : "light"} />;
}
