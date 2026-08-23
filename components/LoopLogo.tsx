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
      container: "h-8 w-8 rounded-lg",
      icon: "h-4 w-4 stroke-[2.5]",
      ringOffset: "ring-offset-1",
    },
    md: {
      container: "h-9 w-9 rounded-xl",
      icon: "h-5 w-5 stroke-[2.5]",
      ringOffset: "ring-offset-2",
    },
    lg: {
      container: "h-13 w-13 rounded-2xl",
      icon: "h-7 w-7 stroke-[2.5]",
      ringOffset: "ring-offset-4",
    },
    xl: {
      container: "h-15 w-15 rounded-2xl",
      icon: "h-8 w-8 stroke-[2.5]",
      ringOffset: "ring-offset-4",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl blur-md opacity-60 pointer-events-none" />
      )}
      <div
        className={`relative inline-flex items-center justify-center ${currentSize.container} bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/40 ring-offset-[#050711] ${currentSize.ringOffset}`}
      >
        <InfinityIcon className={`${currentSize.icon} text-white shrink-0 block m-auto`} />
      </div>
    </div>
  );
}
