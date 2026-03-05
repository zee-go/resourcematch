import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { LogoIcon } from "@/components/LogoIcon";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token, email } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If no token/email in URL, show the "request reset" form
  const [requestEmail, setRequestEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const hasResetParams = token && email;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: requestEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setRequestSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password - ResourceMatch"
        description="Reset your ResourceMatch account password."
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoIcon className="w-10 h-10" color="accent" />
              <span className="text-xl font-semibold text-evening-sea">
                ResourceMatch
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {success ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-evening-sea mb-2">
                  Password Reset
                </h1>
                <p className="text-slate-600 mb-6">
                  Your password has been updated successfully.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-evening-sea hover:bg-evening-sea/90"
                >
                  Sign In
                </Button>
              </div>
            ) : hasResetParams ? (
              <form onSubmit={handleResetPassword}>
                <h1 className="text-2xl font-bold text-evening-sea mb-2">
                  Set New Password
                </h1>
                <p className="text-slate-600 mb-6">
                  Enter your new password below.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        placeholder="Re-enter your password"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-evening-sea hover:bg-evening-sea/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Reset Password
                  </Button>
                </div>
              </form>
            ) : requestSent ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-evening-sea mb-2">
                  Check Your Email
                </h1>
                <p className="text-slate-600 mb-6">
                  If an account exists with that email, we&apos;ve sent a
                  password reset link. Check your inbox and spam folder.
                </p>
                <Link
                  href="/login"
                  className="text-sm text-raw-sienna hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleRequestReset}>
                <h1 className="text-2xl font-bold text-evening-sea mb-2">
                  Forgot Password
                </h1>
                <p className="text-slate-600 mb-6">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-evening-sea hover:bg-evening-sea/90"
                    disabled={requestLoading}
                  >
                    {requestLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Send Reset Link
                  </Button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-raw-sienna hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
