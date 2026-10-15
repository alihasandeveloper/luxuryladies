"use client";

import { Toaster } from "sonner";
import { Check, AlertCircle } from "lucide-react";

export default function ThemeToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      icons={{
        success: (
          <span className="w-5 h-5 rounded-full bg-success-bg text-success border border-success/30 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={2.5} />
          </span>
        ),
        error: (
          <span className="w-5 h-5 rounded-full bg-red-50 text-error border border-error/30 flex items-center justify-center shrink-0">
            <AlertCircle size={12} strokeWidth={2.5} />
          </span>
        ),
      }}
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "var(--color-dark)",
          border: "1px solid var(--color-border)",
          borderRadius: "0px",
          boxShadow: "0 10px 25px -5px rgba(25, 20, 38, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          padding: "12px 14px",
        },
        actionButtonStyle: {
          background: "var(--color-primary)",
          color: "#ffffff",
          fontWeight: "600",
          fontSize: "12px",
          padding: "6px 12px",
          borderRadius: "0px",
        },
        classNames: {
          toast: "font-sans !border-border !bg-white shadow-lg !rounded-none",
          title: "!text-dark font-semibold text-xs sm:text-sm",
          description: "!text-description text-xs",
          actionButton: "!bg-primary hover:!bg-primary-hover !text-white text-xs font-semibold px-3 py-1.5 !rounded-none transition-colors",
          closeButton: "!left-auto !right-0 !translate-x-[35%] !bg-white !border-border !text-description hover:!text-primary !rounded-none",
        },
      }}
    />
  );
}
