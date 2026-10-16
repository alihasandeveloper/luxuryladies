import { Suspense } from "react";
import RegisterView from "@/components/RegisterView";

export const metadata = {
  title: "Create Account | luxuryladies",
  description: "Register a new luxuryladies account to track orders, save shipping addresses, and enjoy seamless shopping.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterView />
    </Suspense>
  );
}
