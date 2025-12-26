    "use client";
    import Image from "next/image";
    import Link from "next/link";
    import { useState } from "react";

    const NAV_LINKS =[
        {href: "#",label:"Home"},
        {href: "#adopt",label:"Adopt"},
        {href: "#rescue",label:"Rescue"},
        {href: "#about",label:"About"}
    ]

    export default function Header() {
        const [open, setOpen] = useState(false);
    return (
        
        <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-white/10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-">
            <div className="flex h-16 items-center justify-between w-full">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <a href="/" className="flex items-center gap-2 group">
                <span >
                    <Image
                    src="/images/logo.png"
                    alt="
                    AdoptNest"
                    height={50}
                    width={50}      

                    />
                </span>
                <span className="text-base font-semibold tracking-tight group-hover:opacity-80 transition-opacity">
                    AdoptNest
                </span>
                </a>
            </div>

            {/* Center: Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium transition-colors hover:text-foreground/100 text-foreground/60"
                >
                    {link.label}
                </a>
                ))}
            </div>

                {/* Login button */}
                <div className="hidden md:flex">
                    <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg bg-red-700 text-white 
                    text-sm
                    hover:bg-foreground/5 
                    transition-colors">Login</Link>
                </div>
            

                {/* Mobile hamburger */}
                <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={open}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/15 hover:bg-foreground/5 transition-colors"
                >
                {open ? (
                    // Close icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                ) : (
                    // Hamburger icon
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                    </svg>
                )}
                </button>
            </div>
        

            {/* Mobile panel */}
            <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
            <div className="pb-4 pt-2 border-t border-black/10 dark:border-white/10">
                <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                    <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 text-foreground/70"
                    >
                    {link.label}
                    </a>
                ))}
                <div className="mt-2 flex items-center gap-2">
                                    <Link
                                        href="/login"
                                        className="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-md border border-black/10
                                        bg-red-700 dark:border-white/15 text-sm font-medium hover:bg-foreground/5 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                </div>
                </div>
            </div>
            </div>
        </nav>
        </header>
    );

    }
