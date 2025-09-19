"use client";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode class on the html element
  useEffect(() => {
    const root = document.documentElement;
    console.log("Toggling dark mode:", isDarkMode); // Debug log

    if (isDarkMode) {
      root.classList.add("dark");
      console.log("Added dark class, classes:", root.classList.toString());
    } else {
      root.classList.remove("dark");
      console.log("Removed dark class, classes:", root.classList.toString());
    }
  }, [isDarkMode]);

  const debugDarkMode = () => {
    const root = document.documentElement;
    console.log("=== DARK MODE DEBUG ===");
    console.log("HTML classes:", root.classList.toString());
    console.log("Dark class present:", root.classList.contains("dark"));
    console.log("State:", isDarkMode);

    // Test if Tailwind dark classes work
    const testDiv = document.createElement("div");
    testDiv.className = "bg-white dark:bg-slate-900";
    document.body.appendChild(testDiv);
    const styles = window.getComputedStyle(testDiv);
    console.log("Test div background color:", styles.backgroundColor);
    document.body.removeChild(testDiv);
    console.log("========================");
  };

  // Update your button:

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white dark:bg-dark-bg text-black dark:text-white transition-colors">
      <h1 className="mb-8 text-3xl font-bold text-blue-600 dark:text-blue-400">
        Hello, Tailwind with Nextjs!
      </h1>
      <div className="bg-red-500 p-4 text-white">
        <h1 className="text-2xl">Test</h1>
      </div>

      {/* ADD THIS BUTTON */}
      <button
        onClick={() => {
          setIsDarkMode(!isDarkMode);
          setTimeout(debugDarkMode, 100); // Run debug after state update
        }}
      >
        Toggle {isDarkMode ? "Light" : "Dark"} Mode
      </button>

      <p className="mt-4 text-sm opacity-70">
        Current mode: {isDarkMode ? "Dark" : "Light"}
      </p>
    </div>
  );
}
