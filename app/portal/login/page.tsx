import { Suspense } from "react";
import PortalLoginPageClient from "./PortalLoginPageClient";

export const dynamic = "force-dynamic";

export default function PortalLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginPageClient />
    </Suspense>
  );
}
