"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  // Form state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.error("Please enter both username/email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="w-full py-16 md:py-24 px-4">
        <div className="w-full max-w-[500px] mx-auto text-center p-8 bg-white border border-border" style={{ maxWidth: "500px" }}>
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-xl font-medium text-dark mb-2">Already Signed In</h1>
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
    <div className="w-full py-12 md:py-20 bg-bg/40 px-4">
      <div className="w-full max-w-[500px] mx-auto bg-white border border-border shadow-xs p-6 sm:p-8" style={{ maxWidth: "500px" }}>
        <h1 className="text-xl md:text-2xl font-semibold text-center text-dark mb-6">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
              Username or Email Address <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username or email"
                required
                autoComplete="username"
                className="w-full h-11 px-3.5 pl-10 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Mail size={16} />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-dark mb-1.5">
              Password <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-11 px-3.5 pl-10 pr-10 text-sm bg-white border border-border focus:border-primary focus:outline-hidden transition-colors rounded-none placeholder:text-slate-400"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock size={16} />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-dark transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Switch to Register link */}
          <div className="text-center pt-3 border-t border-border mt-5">
            <p className="text-xs text-description">
              Don&apos;t have an account yet?{" "}
              <Link
                href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
                className="text-primary font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
