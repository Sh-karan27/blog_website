"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import ThemeProvider from "./ThemeProvider";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith("/register") || pathname === "/login";

  return (
    <Provider store={store}>
      <ThemeProvider />
      {!hideNavbar && <Navbar />}
      {children}
    </Provider>
  );
}
