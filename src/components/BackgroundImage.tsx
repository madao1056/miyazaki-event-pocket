"use client";

import { useState, useEffect } from "react";
import { backgroundImages } from "@/lib/backgrounds";

export default function BackgroundImage() {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setImageUrl(backgroundImages[randomIndex]);
  }, []);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70 backdrop-blur-[2px]" />
    </div>
  );
}
