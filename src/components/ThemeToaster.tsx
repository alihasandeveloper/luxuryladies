"use client";

import { Toaster } from "sonner";
import { Check } from "lucide-react";

export default function ThemeToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      icons={{
        success: (
          <span className="w-5 h-5 rounded-full bg-[#FFF0F5] text-[#ff0080] border border-[#ff0080]/30 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={2.5} />
          </span>
        ),
      }}
      toastOptions={{
        style: {
          background: "#ffffff",
          color: "#251A1F",
          border: "1px solid #F2E6EC",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(255, 0, 128, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          padding: "12px 14px",
        },
        actionButtonStyle: {
          background: "#ff0080",
          color: "#ffffff",
          fontWeight: "600",
          fontSize: "12px",
          padding: "6px 12px",
          borderRadius: "6px",
        },
        classNames: {
          toast: "font-sans !border-[#F2E6EC] !bg-white shadow-lg",
          title: "!text-[#251A1F] font-semibold text-xs sm:text-sm",
          description: "!text-[#8C7B82] text-xs",
          actionButton: "!bg-[#ff0080] hover:!bg-[#d4006a] !text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors",
          closeButton: "!bg-white !border-[#F2E6EC] !text-[#8C7B82] hover:!text-[#ff0080]",
        },
      }}
    />
  );
}
