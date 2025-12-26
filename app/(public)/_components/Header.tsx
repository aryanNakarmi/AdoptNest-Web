"use client";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-red-100 dark:border-surface-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
           <Image
                      src="/images/logo.png"
                      alt="pet logo"
                      height={40}
                      width={40}
                      className="object-cover "/>
          <h2 className="text-xl font-bold tracking-tight">AdoptNest</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Adopt</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Report</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
        </nav>
        <button className="rounded-xl h-10 px-4 bg-primary text-white font-bold hover:scale-105 transition-transform">Donate</button>
      </div>
    </header>
  );
}
