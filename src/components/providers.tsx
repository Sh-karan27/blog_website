"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import ThemeProvider from "./ThemeProvider";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/lib/ProtectedRoute";
import { ToastContainer } from "react-toastify";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public pages that don't need authentication
  const publicPaths = ["/login", "/register"];
  const isProtected = !publicPaths.includes(pathname);

  const hideNavbar = publicPaths.includes(pathname);

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
      {isProtected ? <ProtectedRoute>{children}</ProtectedRoute> : children}
    </Provider>
  );
}
