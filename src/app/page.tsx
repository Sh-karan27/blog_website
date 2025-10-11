"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/lib/ProtectedRoute";
import HomeContent from "@/components/HomeContent";

export default function Page() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
