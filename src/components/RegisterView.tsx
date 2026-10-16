"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { user, isAuthenticated, register, logout, isLoading } = useAuth();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      email: email.trim(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="w-full py-16 md:py-24">
        <div className="container max-w-lg mx-auto text-center p-8 bg-white border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-medium text-dark mb-2">Already Registered & Signed In</h1>
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
    <div className="w-full py-12 md:py-20 bg-bg/40">
      <div className="container max-w-[500px] mx-auto px-4">
        <div className="bg-white border border-border shadow-xs p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-description uppercase block mb-1.5">
              BECOME A MEMBER
            </span>
            <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-dark mb-2">
              Create Account
            </h1>
            <div className="w-10 h-[1px] bg-border mx-auto mb-3" />
            <p className="text-xs md:text-sm text-description">
              Sign up today to track orders, save multiple addresses, and enjoy faster checkout.
            </p>
          </div>

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
                  placeholder="e.g. Sarah"
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
                  placeholder="e.g. Khan"
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

            {/* Username (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
                Username <span className="text-slate-400 font-normal text-[11px] lowercase">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  autoComplete="username"
                  className="w-full h-11 px-3.5 pl-10 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User size={16} />
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

            {/* Terms notice */}
            <p className="text-[11px] text-description leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="/terms-of-service" className="text-dark underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-dark underline hover:text-primary">
                Privacy Policy
              </Link>.
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 !bg-primary hover:!bg-primary-hover !text-white text-xs md:text-sm font-bold tracking-wider uppercase transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
            <div className="text-center pt-3 border-t border-border">
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
    </div>
  );
}
