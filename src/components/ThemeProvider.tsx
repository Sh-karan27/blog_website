"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setTheme } from "@/redux/themeSlice";

export default function ThemeProvider() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const hydrated = useRef(false);

  // Restore saved preference on first load
  useEffect(() => {
    const saved = localStorage.getItem("mono-theme");
    if (saved) dispatch(setTheme(saved === "dark"));
    hydrated.current = true;
  }, [dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (hydrated.current) {
      localStorage.setItem("mono-theme", isDarkMode ? "dark" : "light");
    }
  }, [isDarkMode]);

  return null; // this just manages classes
}
