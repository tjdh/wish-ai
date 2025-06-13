"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Wrapper component ➜ provides the required <Suspense> boundary.
 * Contains **no hooks** so it can render immediately, satisfying Next.js CSR‑bailout rule.
 */
export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}> {/* <—— satisfies Next 15 requirement */}
      <ConfirmEmailInner /> {/* hooks live here */}
    </Suspense>
  );
}

/** Simple loading spinner used by the Suspense fallback */
function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00818A] mx-auto" />
        <p className="mt-4 text-gray-600">Loading…</p>
      </div>
    </main>
  );
}

/**
 * Actual client component with all original logic.
 * Placed **inside** Suspense so `useSearchParams()` is allowed.
 */
function ConfirmEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [resendEmail, setResendEmail] = useState<string>("");
  const [isFromEmailLink, setIsFromEmailLink] = useState(false);

  /* ------------------------------------------------------------ */
  /*  Check confirmation status on mount                          */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const supabase = createClient();

      try {
        // 1️⃣ Handle errors passed as query params from Supabase redirect
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        if (errorParam) {
          setError(errorDescription || "There was an error confirming your email.");
          setIsLoading(false);
          return;
        }

        // 2️⃣ Handle hash tokens (Supabase puts access_token in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");
        if (accessToken && type === "signup") {
          setIsFromEmailLink(true);
          setEmailConfirmed(true);
          // cleanup hash so users don’t see it
          window.history.replaceState(null, "", window.location.pathname);
          setIsLoading(false);
          return;
        }

        // 3️⃣ Fallback: check the current user session
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
          if (user.email_confirmed_at) {
            router.push("/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Email confirmation error:", err);
        setError("There was an error checking your email confirmation.");
      } finally {
        setIsLoading(false);
      }
    };

    checkEmailConfirmation();
  }, [router, searchParams]);

  /* ------------------------------------------------------------ */
  /*  Helper actions                                              */
  /* ------------------------------------------------------------ */
  const handleResendEmail = async () => {
    const emailToUse = resendEmail || userEmail;
    if (!emailToUse || !emailToUse.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email: emailToUse });
      if (error) throw error;
      alert("Confirmation email sent! Please check your inbox.");
      setResendEmail("");
    } catch (err) {
      console.error("Resend email error:", err);
      setError("Failed to resend confirmation email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToDashboard = async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    router.push(session ? "/dashboard" : "/signin");
  };

  /* ------------------------------------------------------------ */
  /*  Render logic                                                */
  /* ------------------------------------------------------------ */
  if (isLoading) return <LoadingFallback />;

  /* ——— View shown if user clicked the confirmation link ——— */
  if (isFromEmailLink && emailConfirmed) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-center">
          <Image src="/images/arx-logo.svg" alt="arx logo" width={120} height={40} priority />
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Email Confirmed Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-gray-600">Your email has been confirmed. You can now close this window and return to the original tab to continue.</p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>You can close this tab</strong> and return to your original browser window to access your dashboard.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-4">Or if you prefer, you can:</p>
                    <Button onClick={handleReturnToDashboard} className="w-full bg-[#00818A] hover:bg-[#00636a] text-white py-6 text-lg font-semibold">
                      Go to Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  /* ——— Default view: waiting for confirmation ——— */
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white">
      <div className="container mx-auto px-4 py-6 flex items-center justify-center">
        <Image src="/images/arx-logo.svg" alt="arx logo" width={120} height={40} priority />
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center">
                {error ? (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-[#C8FAFF] rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-[#00818A]" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">{error ? "Confirmation Error" : "Check Your Email"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error ? (
                <>
                  <p className="text-center text-red-600">{error}</p>
                  <Link href="/signin" className="block">
                    <Button variant="outline" className="w-full py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20">
                      Back to Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="space-y-4 text-center">
                    <p className="text-gray-600">We&apos;ve sent a confirmation email to:</p>
                    <p className="font-semibold text-lg text-gray-900">{userEmail || "your email address"}</p>
                    <p className="text-sm text-gray-500">Please check your inbox and click the confirmation link to activate your account.</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Didn&apos;t receive the email?</strong> Check your spam folder or use the form below to resend.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full"
                    />
                    <Button
                      onClick={handleResendEmail}
                      variant="outline"
                      disabled={isLoading}
                      className="w-full py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20"
                    >
                      {isLoading ? "Sending..." : "Resend Confirmation Email"}
                    </Button>
                  </div>
                  <div className="text-center">
                    <Link href="/signin" className="text-sm text-[#00818A] hover:underline">
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
