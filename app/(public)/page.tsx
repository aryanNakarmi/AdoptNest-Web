"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center">
      {/* Background image */}
      <Image
        src="/images/image2.png" // put your image in /public/images/
        alt="AdoptNest Hero"
        fill
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Find Your Perfect Companion
        </h1>
        <p className="text-lg sm:text-xl mb-8">
          Adopt, Rescue, and Give Love to Animals in Need
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="#adopt"
            className="px-6 py-3 rounded-lg bg-[#ee3861] font-semibold hover:opacity-90 transition"
          >
            Adopt Now
          </Link>
          <Link
            href="#rescue"
            className="px-6 py-3 rounded-lg border border-white font-semibold hover:bg-white hover:text-black transition"
          >
            Rescue
          </Link>
        </div>
      </div>
    </section>
  );
}
