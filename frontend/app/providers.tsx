"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="white">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
