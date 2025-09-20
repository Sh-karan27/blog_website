"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/lib/ProtectedRoute";

function PageContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDarkMode]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-dark-bg text-black dark:text-white transition-colors">
      <h1 className="mb-8 text-3xl font-bold text-blue-600 dark:text-blue-400">
        Hello, Tailwind with Nextjs!
      </h1>
      <div className="bg-red-500 p-4 text-white">
        <h1 className="text-2xl">Test</h1>
      </div>
      <button onClick={() => setIsDarkMode(!isDarkMode)}>
        Toggle {isDarkMode ? "Light" : "Dark"} Mode
      </button>
      <p className="mt-4 text-sm opacity-70">
        Current mode: {isDarkMode ? "Dark" : "Light"}
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  );
}
