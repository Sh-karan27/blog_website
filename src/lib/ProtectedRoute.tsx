"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import LoadingScreen from "@/utils/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        setAuthorized(true);
        return;
      }

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        router.push("/login");
        setAuthorized(false);
        return;
      }

      try {
        const res = await axiosInstance.post("/users/refresh-token", { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        setAuthorized(true);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
        setAuthorized(false);
      }
    };

    restoreSession();
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
