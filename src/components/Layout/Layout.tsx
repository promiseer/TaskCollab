import { type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return; // Still loading

    // Allow access to authentication pages
    const publicPages = ["/", "/login", "/register", "/forgot-password"];
    const isPublicPage = publicPages.includes(router.pathname);
    
    if (!session && !isPublicPage) {
      void router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // Allow access to authentication pages
  const publicPages = ["/", "/login", "/register", "/forgot-password"];
  const isPublicPage = publicPages.includes(router.pathname);

  if (!session && !isPublicPage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session && <Navbar />}
      <main className={session ? "py-6" : ""}>{children}</main>
    </div>
  );
}
