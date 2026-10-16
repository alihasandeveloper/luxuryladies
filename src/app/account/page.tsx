import { Suspense } from "react";
import AccountView from "@/components/AccountView";

export const metadata = {
  title: "My Account | luxuryladies",
  description: "Manage your luxuryladies account, track orders, and update your personal information and addresses.",
};

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AccountView />
    </Suspense>
  );
}
