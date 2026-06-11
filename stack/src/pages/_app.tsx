import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      const publicPaths = ['/auth', '/signup', '/forgot-password'];
      if (!publicPaths.includes(router.pathname)) {
        router.push('/auth');
      }
    }
  }, [user, router.pathname]);

  return <>{children}</>;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
        <AuthProvider>
          <LanguageProvider>
            <ToastContainer />
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          </LanguageProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </>
  );
}
