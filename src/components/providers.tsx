"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import ThemeProvider from "./ThemeProvider";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import Footer from "./Footer";

const AUTH_PATHS = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/write", "/settings", "/blog/edit"];

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = AUTH_PATHS.includes(pathname);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <Provider store={store}>
      <ThemeProvider />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      {!hideNavbar && <Navbar />}
      <div>
        {isProtected ? <ProtectedRoute>{children}</ProtectedRoute> : children}
      </div>
      {!hideNavbar && <Footer />}
    </Provider>
  );
}
