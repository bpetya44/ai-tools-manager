"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role?.slug !== "admin") {
        router.push("/");
      } else {
        // Redirect to admin dashboard
        router.push("/admin/dashboard");
      }
    }
  }, [user, isLoading, router]);

  // This component just redirects, so we don't need to render anything
  return null;
}
