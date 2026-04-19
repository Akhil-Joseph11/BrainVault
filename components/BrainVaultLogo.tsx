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
        <div className="absolute inset-0 animate-pulse-soft rounded-xl bg-gradient-to-br from-silver-400 to-silver-600 blur-md opacity-30 motion-reduce:animate-none motion-reduce:opacity-25" />
        <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-silver-300 via-silver-200 to-silver-400 p-1.5 shadow-lg shadow-silver-400/35 ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-silver-400/50">
          <Brain className={`${sizes[size]} text-black`} strokeWidth={2} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} bg-gradient-to-r from-silver-200 via-white to-silver-200 bg-[length:200%_auto] bg-left bg-clip-text font-bold tracking-tight text-transparent transition-[background-position] duration-700 ease-out hover:bg-right motion-reduce:transition-none`}
          >
            BrainVault
          </span>
          {size !== "sm" && (
            <span className="text-xs text-silver-400/60 font-medium tracking-wider">
              INTELLIGENT DOCUMENT AI
            </span>
          )}
        </div>
      )}
    </div>
  );
}

