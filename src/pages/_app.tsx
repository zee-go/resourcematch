import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster />
    </AuthProvider>
  );
}
