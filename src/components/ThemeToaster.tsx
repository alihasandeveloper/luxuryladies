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
          <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#2E7D32]/30 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={2.5} />
          </span>
        ),
        error: (
          <span className="w-5 h-5 rounded-full bg-[#FFEBEE] text-[#E53935] border border-[#E53935]/30 flex items-center justify-center shrink-0">
            <AlertCircle size={12} strokeWidth={2.5} />
          </span>
        ),
      }}
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#191426",
          border: "1px solid #E8E2E5",
          borderRadius: "0px",
          boxShadow: "0 10px 25px -5px rgba(25, 20, 38, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          padding: "12px 14px",
        },
        actionButtonStyle: {
          background: "#E91E63",
          color: "#ffffff",
          fontWeight: "600",
          fontSize: "12px",
          padding: "6px 12px",
          borderRadius: "0px",
        },
        classNames: {
          toast: "font-sans !border-[#E8E2E5] !bg-white shadow-lg !rounded-none",
          title: "!text-[#191426] font-semibold text-xs sm:text-sm",
          description: "!text-[#6F6470] text-xs",
          actionButton: "!bg-[#E91E63] hover:!bg-[#C2185B] !text-white text-xs font-semibold px-3 py-1.5 !rounded-none transition-colors",
          closeButton: "!bg-white !border-[#E8E2E5] !text-[#6F6470] hover:!text-[#E91E63] !rounded-none",
        },
      }}
    />
  );
}
