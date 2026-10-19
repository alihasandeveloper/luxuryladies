"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe, Check } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "header" | "drawer" | "compact";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "header",
  className = "",
}: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage, isBangla } = useLanguage();

  if (variant === "drawer") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-description flex items-center gap-1.5">
            <Globe size={13} className="text-primary" />
            <span>{isBangla ? "ভাষা পরিবর্তন" : "Language"}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              language === "en"
                ? "bg-white text-dark shadow-xs border border-border/80 font-bold"
                : "text-slate-600 hover:text-dark hover:bg-white/50"
            }`}
            aria-label="Switch to English"
          >
            <span>English</span>
            {language === "en" && <Check size={13} className="text-primary" />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("bn")}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer font-bangla ${
              language === "bn"
                ? "bg-white text-primary shadow-xs border border-border/80 font-bold"
                : "text-slate-600 hover:text-dark hover:bg-white/50"
            }`}
            aria-label="Switch to Bangla"
          >
            <span>বাংলা</span>
            {language === "bn" && <Check size={13} className="text-primary" />}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors text-slate-700 hover:text-primary ${className}`}
        title={isBangla ? "Switch to English" : "বাংলায় দেখুন"}
        aria-label="Toggle language"
      >
        <Globe size={14} className="text-primary" />
        <span className={isBangla ? "font-bangla" : ""}>
          {isBangla ? "EN" : "বাংলা"}
        </span>
      </button>
    );
  }

  // Default: Header pill
  return (
    <div
      className={`relative inline-flex items-center rounded-full p-0.5 border border-border bg-slate-50 shadow-2xs ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full transition-all duration-200 cursor-pointer ${
          language === "en"
            ? "bg-primary text-white shadow-xs font-bold"
            : "text-slate-600 hover:text-dark hover:bg-slate-200/50"
        }`}
        aria-label="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full transition-all duration-200 cursor-pointer font-bangla ${
          language === "bn"
            ? "bg-primary text-white shadow-xs font-bold"
            : "text-slate-600 hover:text-dark hover:bg-slate-200/50"
        }`}
        aria-label="বাংলা"
      >
        বাংলা
      </button>
    </div>
  );
}
