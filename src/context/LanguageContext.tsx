"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { en } from "@/locales/en";
import { bn } from "@/locales/bn";

export type Language = "en" | "bn";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isBangla: boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number | string) => string;
  formatPrice: (price: number | string, options?: { showSymbol?: boolean }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumber(input: number | string): string {
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("luxuryladies_lang") as Language | null;
      if (savedLang === "en" || savedLang === "bn") {
        setLanguageState(savedLang);
        document.documentElement.lang = savedLang;
        if (savedLang === "bn") {
          document.body.classList.add("lang-bn");
        } else {
          document.body.classList.remove("lang-bn");
        }
      }
    } catch {
      // localStorage unavailable or security restricted
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("luxuryladies_lang", newLang);
      document.documentElement.lang = newLang;
      if (newLang === "bn") {
        document.body.classList.add("lang-bn");
      } else {
        document.body.classList.remove("lang-bn");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "bn" : "en");
  }, [language, setLanguage]);

  const isBangla = language === "bn";

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      const dict = isBangla ? bn : en;
      const fallbackDict = en;

      let value: any = dict;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }

      // Fallback to English if not found
      if (value === undefined) {
        let fallbackVal: any = fallbackDict;
        for (const k of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && k in fallbackVal) {
            fallbackVal = fallbackVal[k];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        value = fallbackVal;
      }

      if (typeof value !== "string") {
        return path;
      }

      // Replace parameters {key}
      if (params) {
        let interpolated = value;
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          const formattedVal =
            isBangla && typeof paramVal === "number"
              ? toBengaliNumber(paramVal)
              : String(paramVal);
          interpolated = interpolated.replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            formattedVal
          );
        });
        return interpolated;
      }

      return value;
    },
    [isBangla]
  );

  const formatNumber = useCallback(
    (num: number | string): string => {
      if (num === null || num === undefined || num === "") return "";
      const numVal = typeof num === "number" ? num : parseFloat(String(num));
      if (isNaN(numVal)) {
        return isBangla ? toBengaliNumber(num) : String(num);
      }
      const formattedEn = numVal.toLocaleString("en-US");
      return isBangla ? toBengaliNumber(formattedEn) : formattedEn;
    },
    [isBangla]
  );

  const formatPrice = useCallback(
    (price: number | string, options?: { showSymbol?: boolean }): string => {
      const { showSymbol = true } = options || {};
      const numVal = typeof price === "number" ? price : parseFloat(String(price) || "0");
      const safeNum = isNaN(numVal) ? 0 : numVal;
      const formattedNumberStr = safeNum.toLocaleString("en-US");

      if (isBangla) {
        const bnFormatted = toBengaliNumber(formattedNumberStr);
        return showSymbol ? `৳ ${bnFormatted}` : bnFormatted;
      }

      return showSymbol ? `Tk ${formattedNumberStr}` : formattedNumberStr;
    },
    [isBangla]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isBangla,
        t,
        formatNumber,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
