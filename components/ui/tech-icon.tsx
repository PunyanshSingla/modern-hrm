"use client";

import { useState } from "react";
import { type Technology } from "@/lib/technologies";

interface TechIconProps {
  tech: Technology | undefined;
  size?: number;
}

export function TechIcon({ tech, size = 20 }: TechIconProps) {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  if (!tech || !tech.icon) {
    return <span className="text-lg" style={{ fontSize: size }}>🔧</span>;
  }

  const allIcons = [tech.icon, ...(tech.iconFallbacks || [])];
  const currentIcon = allIcons[currentIconIndex];

  const handleError = () => {
    if (currentIconIndex < allIcons.length - 1) {
      setCurrentIconIndex(prev => prev + 1);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentIcon) {
    return <span className="text-lg" style={{ fontSize: size }}>🔧</span>;
  }

  return (
    <img
      src={currentIcon}
      alt={tech.name}
      width={size}
      height={size}
      onError={handleError}
      className="object-contain"
      style={{ minWidth: size, minHeight: size }}
    />
  );
}
