"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page redirects to projects (default view)
// The layout.tsx handles auth and navbar
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/projects");
  }, [router]);

  return null;
}
