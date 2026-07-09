"use client";

import { useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setTheme } from "@/redux/themeSlice";

export default function ThemeProvider() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const initialized = useRef(false);

  // Runs before paint so there's no flash between hydration and applying the theme.
  useLayoutEffect(() => {
    const root = document.documentElement;

    if (!initialized.current) {
      initialized.current = true;
      // The blocking <script> in layout.tsx already set the class on <html> before
      // hydration — read that (or localStorage) as the source of truth instead of
      // trusting Redux's default, which is always `false` on first render.
      const saved = localStorage.getItem("mono-theme");
      const dark = saved ? saved === "dark" : root.classList.contains("dark");
      root.classList.toggle("dark", dark);
      if (dark !== isDarkMode) dispatch(setTheme(dark));
      return;
    }

    root.classList.toggle("dark", isDarkMode);
    localStorage.setItem("mono-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, dispatch]);

  return null; // this just manages classes
}
