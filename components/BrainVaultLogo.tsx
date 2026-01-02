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
    <div className="flex items-center space-x-3">
      <div className={`relative ${sizes[size]}`}>
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-silver-400 to-silver-600 rounded-xl blur-sm opacity-20"></div>
        {/* Main icon container */}
        <div className="relative bg-gradient-to-br from-silver-300 via-silver-200 to-silver-400 rounded-xl p-1.5 shadow-lg shadow-silver-400/30 flex items-center justify-center">
          <Brain className={`${sizes[size]} text-black`} strokeWidth={2} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold bg-gradient-to-r from-silver-200 via-white to-silver-200 bg-clip-text text-transparent tracking-tight`}>
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

