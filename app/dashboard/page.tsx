import { Suspense } from "react";
import DashboardPage from "./DashboardClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted">
          Chargement...
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}
