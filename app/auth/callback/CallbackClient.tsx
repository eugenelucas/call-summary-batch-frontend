// "use client"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"

// export default function AuthCallbackPage() {
//   const router = useRouter()

//   useEffect(() => {
//     const url = new URL(window.location.href)
//     const token = url.searchParams.get("token")

//     if (token) {
//       document.cookie = `access_token=${token}; path=/`

//       // Redirect user to your dashboard or home page
//       router.push("/")
//     } else {
//       // Redirect to login with error if no token
//       router.push("/error=missing_token")
//     }
//   }, [])

//   return <p>Logging in...</p>
// }


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { decodeJWT } from "@/app/utils/decodeJWT";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Ensure window is available (client-side only)
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    const setCookie = (name: string, value: string) => {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; secure; samesite=strict`;
    };

    const clearCookie = (name: string) => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
    };

    const redirectAccessDenied = (email: string) => {
      const target = `/auth/access-denied?email=${encodeURIComponent(email)}`;
      router.replace(target);
    };

    const handleAuth = async () => {
      if (!token) {
        router.replace("/?error=missing_token");
        return;
      }

      // Persist token immediately so future requests can include it
      setCookie("access_token", token);

      const decoded = decodeJWT(token);
      const email: string | null =
        decoded?.email || decoded?.Email || decoded?.user_email || decoded?.preferred_username || null;

      if (!email) {
        clearCookie("access_token");
        router.replace("/?error=invalid_token");
        return;
      }

      try {
        const roleRes = await fetch(
          `https://ai-call-summary-ap-batch-fjfxdsdhdkd5b7bt.centralus-01.azurewebsites.net/get-user-role?email=${encodeURIComponent(
            email
          )}`,
          { headers: { accept: "application/json" }, cache: "no-store" }
        );

        if (!roleRes.ok) {
          clearCookie("access_token");
          redirectAccessDenied(email);
          return;
        }

        const roleData = await roleRes.json();
        const role: string | undefined = roleData?.role;
        const allowed = role === "Admin" || role === "User";

        if (!allowed) {
          clearCookie("access_token");
          clearCookie("user_role");
          clearCookie("user_email");
          redirectAccessDenied(email);
          return;
        }

        // Save role and email for middleware/UX usage
        setCookie("user_role", role!);
        setCookie("user_email", email);

        router.replace("/");
      } catch {
        clearCookie("access_token");
        redirectAccessDenied(email || "unknown");
      }
    };

    void handleAuth();
  }, [router]); // Added router to dependencies

  return (
    <div id="auth-callback-root" className="min-h-screen flex items-center justify-center whitespace-pre-wrap">
      <p className="text-gray-600">Logging in...</p>
    </div>
  );
}