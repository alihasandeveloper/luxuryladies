"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { user, isAuthenticated, register, logout, isLoading } = useAuth();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      email: email.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setFormError(result.message || "Registration failed. Please check your details.");
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="w-full py-16 md:py-24 px-4">
        <div className="w-full max-w-[500px] mx-auto text-center p-8 bg-white border border-border" style={{ maxWidth: "500px" }}>
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-xl font-medium text-dark mb-2">Already Registered & Signed In</h1>
          <p className="text-sm text-description mb-6">
            You are currently signed in as <strong className="text-dark">{user.email}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/account"
              className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover !text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Go to My Account
            </Link>
            <button
              onClick={() => logout()}
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-bg text-dark border border-border hover:border-primary text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 md:py-20 px-4">
      <div className="w-full max-w-[500px] mx-auto bg-white border border-border shadow-sm p-6 sm:p-8" style={{ maxWidth: "500px" }}>
        <h1 className="text-xl md:text-2xl font-semibold text-center text-dark mb-6">
          Create Account
        </h1>

        {formError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <p className="grow leading-snug">{formError}</p>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-400 hover:text-red-700 cursor-pointer ml-1 text-sm font-bold leading-none"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full h-11 px-3.5 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full h-11 px-3.5 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
              Email Address <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                className="w-full h-11 px-3.5 pl-10 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail size={16} />
              </div>
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
                Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full h-11 px-3.5 pr-9 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
                Confirm Password <span className="text-primary">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full h-11 px-3.5 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 !bg-primary hover:!bg-primary-hover !text-white text-xs md:text-sm font-bold tracking-wider uppercase transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Switch to Login link */}
          <div className="text-center pt-3 border-t border-border mt-5">
            <p className="text-xs text-description">
              Already have an account?{" "}
              <Link
                href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
                className="text-primary font-semibold hover:underline"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
