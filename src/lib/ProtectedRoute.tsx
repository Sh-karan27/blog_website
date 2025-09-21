"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/utils/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      router.push("/login");
      setAuthorized(false); // optional, not really used
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // While checking token
  if (authorized === null) {
    return <LoadingScreen />;
  }

  // Redirecting? You can also return null here
  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
