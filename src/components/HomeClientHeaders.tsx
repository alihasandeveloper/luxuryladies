"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function CategorySectionHeader() {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-6">
      <span className="text-[11px] md:text-xs font-semibold tracking-[0.25em] text-description uppercase block mb-2">
        {t("common.curatedCollections")}
      </span>
      <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-dark">
        {t("common.shopByCategory")}
      </h2>
      <div className="w-12 h-[1px] bg-border mx-auto mt-3" />
    </div>
  );
}

export function SeeMoreLink({ href }: { href: string }) {
  const { t } = useLanguage();
  return (
    <Link
      href={href}
      className="text-xs md:text-sm font-medium text-description hover:!text-primary inline-flex items-center gap-0.5 transition-colors group cursor-pointer"
    >
      <span className="hover:!text-primary">{t("common.seeMore")}</span>
      <ChevronRight
        size={15}
        strokeWidth={2}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
