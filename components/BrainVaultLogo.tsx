"use client";

import { Brain } from "lucide-react";

interface BrainVaultLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function BrainVaultLogo({ size = "md", showText = true }: BrainVaultLogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex items-center space-x-3 transition-transform duration-300 ease-out hover:scale-[1.02] motion-reduce:hover:scale-100">
      <div className={`relative ${sizes[size]}`}>
        <div className="absolute inset-0 rounded-xl bg-white/20 blur-md motion-reduce:opacity-100" aria-hidden />
        <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-white via-silver-100 to-silver-300 p-1.5 shadow-lg shadow-black/40 ring-2 ring-white/40">
          <Brain className={`${sizes[size]} text-zinc-900`} strokeWidth={2.25} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold tracking-tight text-white drop-shadow-sm`}>
            BrainVault
          </span>
          {size !== "sm" && (
            <span className="text-xs font-medium tracking-wider text-silver-300">
              INTELLIGENT DOCUMENT AI
            </span>
          )}
        </div>
      )}
    </div>
  );
}

