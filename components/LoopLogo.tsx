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
      outer: "h-8 w-8",
      inner: "h-6 w-6",
      icon: "h-3.5 w-3.5 stroke-[2.75]",
      padding: "p-[2px]",
    },
    md: {
      outer: "h-10 w-10",
      inner: "h-7.5 w-7.5",
      icon: "h-4.5 w-4.5 stroke-[2.75]",
      padding: "p-[2.5px]",
    },
    lg: {
      outer: "h-14 w-14",
      inner: "h-10.5 w-10.5",
      icon: "h-6.5 w-6.5 stroke-[2.75]",
      padding: "p-[3.5px]",
    },
    xl: {
      outer: "h-16 w-16",
      inner: "h-12 w-12",
      icon: "h-7.5 w-7.5 stroke-[2.75]",
      padding: "p-[4px]",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Ambient Radial Glow */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-500 to-purple-400 rounded-full blur-md opacity-70 pointer-events-none" />
      )}

      {/* Outer Concentric Bezel Ring */}
      <div
        className={`relative inline-flex items-center justify-center ${currentSize.outer} rounded-full bg-gradient-to-b from-indigo-400/40 via-indigo-900/80 to-violet-900/50 shadow-[0_0_25px_rgba(99,102,241,0.45)] ring-1 ring-indigo-400/50 ${currentSize.padding}`}
      >
        {/* Dark Separation Ring */}
        <div className="w-full h-full rounded-full bg-[#050711] p-[2px] flex items-center justify-center">
          {/* Inner Luminous Gradient Disc */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-inner">
            {/* High-Contrast White Infinity Loop */}
            <InfinityIcon
              className={`${currentSize.icon} text-white shrink-0 block m-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
