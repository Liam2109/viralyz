import { Suspense } from "react";
import LoginPage from "./LoginClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted">
          Chargement...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
