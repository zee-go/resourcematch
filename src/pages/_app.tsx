import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster />
      </AuthProvider>
    </SessionProvider>
  );
}
