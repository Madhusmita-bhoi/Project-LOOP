import React from "react";
import { Infinity as InfinityIcon } from "lucide-react";

interface LoopLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}

export default function LoopLogo({ size = "md", className = "", glow = true }: LoopLogoProps) {
  const sizeMap = {
    sm: {
      outer: "h-8 w-8 rounded-xl",
      inner: "rounded-[9px]",
      core: "rounded-[7px]",
      icon: "h-3.5 w-3.5 stroke-[2.75]",
      padding: "p-[2px]",
      gap: "p-[1.5px]",
    },
    md: {
      outer: "h-10 w-10 rounded-xl",
      inner: "rounded-[10px]",
      core: "rounded-[8px]",
      icon: "h-4.5 w-4.5 stroke-[2.75]",
      padding: "p-[2px]",
      gap: "p-[2px]",
    },
    lg: {
      outer: "h-14 w-14 rounded-2xl",
      inner: "rounded-[14px]",
      core: "rounded-[11px]",
      icon: "h-6.5 w-6.5 stroke-[2.75]",
      padding: "p-[3px]",
      gap: "p-[2.5px]",
    },
    xl: {
      outer: "h-16 w-16 rounded-2xl",
      inner: "rounded-[15px]",
      core: "rounded-[12px]",
      icon: "h-7.5 w-7.5 stroke-[2.75]",
      padding: "p-[3.5px]",
      gap: "p-[3px]",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Ambient Radial Glow */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-500 to-purple-400 rounded-2xl blur-md opacity-70 pointer-events-none" />
      )}

      {/* Outer Concentric Curved Square Bezel */}
      <div
        className={`relative inline-flex items-center justify-center ${currentSize.outer} bg-gradient-to-b from-indigo-400/50 via-indigo-900/80 to-violet-900/50 shadow-[0_0_25px_rgba(99,102,241,0.45)] ring-1 ring-indigo-400/50 ${currentSize.padding}`}
      >
        {/* Dark Separation Ring with Curved Corners */}
        <div
          className={`w-full h-full ${currentSize.inner} bg-[#050711] ${currentSize.gap} flex items-center justify-center`}
        >
          {/* Inner Luminous Gradient Core with Curved Corners */}
          <div
            className={`w-full h-full ${currentSize.core} bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-inner`}
          >
            {/* Centered High-Contrast White Infinity Loop */}
            <InfinityIcon
              className={`${currentSize.icon} text-white shrink-0 block m-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
