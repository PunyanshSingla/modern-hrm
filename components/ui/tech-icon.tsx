"use client";

import { useState } from "react";
import { type Technology } from "@/lib/technologies";
import { cn } from "@/lib/utils";

interface TechIconProps {
  tech: Technology | undefined;
  size?: number;
  className?: string;
}

export function TechIcon({ tech, size = 20, className }: TechIconProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const fallbackLetter = tech?.name ? tech.name.trim().charAt(0).toUpperCase() : "?";

  if (!tech || !tech.icon || hasError) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold text-primary-foreground bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xs shrink-0 select-none",
          className
        )}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(10, Math.floor(size * 0.55)),
        }}
      >
        {fallbackLetter}
      </span>
    );
  }

  const allIcons = [tech.icon, ...(tech.iconFallbacks || [])];
  const currentIcon = allIcons[currentIconIndex];

  const handleError = () => {
    if (currentIconIndex < allIcons.length - 1) {
      setCurrentIconIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentIcon}
      alt={tech.name}
      width={size}
      height={size}
      onError={handleError}
      className={cn("object-contain shrink-0", className)}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
  );
}

