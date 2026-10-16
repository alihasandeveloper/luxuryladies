import { Suspense } from "react";
import LoginView from "@/components/LoginView";

export const metadata = {
  title: "Account Login & Registration | luxuryladies",
  description: "Sign in to your luxuryladies account or register to track orders, manage addresses, and enjoy faster checkout.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginView />
    </Suspense>
  );
}
