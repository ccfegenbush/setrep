"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/workout"); // Redirect to workout page
  }, [router]);

  return (
    <div className="min-h-screen bg-whoop-dark text-whoop-white flex items-center justify-center">
      <h1 className="text-4xl font-bold text-whoop-green">
        Redirecting to Workouts...
      </h1>
    </div>
  );
}
