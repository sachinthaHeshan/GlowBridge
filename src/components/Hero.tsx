"use client";

import Image from "next/image";
import StatusBar from "./StatusBar";

interface HeroProps {
  totalCategories: number;
  totalServices: number;
}

export default function Hero({ totalCategories, totalServices }: HeroProps) {
  return (
    <section className="relative h-[420px] w-full">
      <Image
        src="/images/hero.jpg"
        alt="Hero"
        fill
        className="object-cover"
        priority
      />

      {/* Left text block (moved a bit right) */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-md ml-24 text-left bg-white/0">
          <h1 className="text-4xl font-bold text-purple-900 mb-3">
            Spa & Beauty Center
          </h1>

          <p className="text-gray-800 mb-4 leading-relaxed">
            Discover premium beauty & wellness services tailored for your lifestyle.
            GlowBridge connects you with trusted salons, treatments and packages to
            help you look and feel your best.
          </p>

          {/* smaller status boxes (slightly longer width) */}
          <div className="mt-4">
            <StatusBar totalCategories={totalCategories} totalServices={totalServices} />
          </div>
        </div>
      </div>
    </section>
  );
}
