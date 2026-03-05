"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#home",   label: "Home"   },
  { href: "#adopt",  label: "Adopt"  },
  { href: "#rescue", label: "Report" },
  { href: "#about",  label: "About"  },
];

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

type Pet = {
  _id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string | number;
  gender?: string;
  status?: string;
  photos?: string[];   // actual field name from API
  images?: string[];   // fallback alias
};

function getPetImageUrl(pet: Pet): string {
  // Use photos first (actual API field), fall back to images
  const arr = pet.photos?.length ? pet.photos : pet.images;
  if (!arr || arr.length === 0) return "";
  const img = arr[0];
  if (img.startsWith("http")) return img;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  // photos already contain the path e.g. "/animal_posts/filename.jpg"
  return `${base}${img}`;
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    fetch(`${base}/api/v1/animal-posts?limit=4`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data ?? data?.posts ?? []);
        const available = list.filter((p: any) => !p.status || p.status.toLowerCase() === "available");
        setPets(available.slice(0, 4));
      })
      .catch(() => setPets([]))
      .finally(() => setPetsLoading(false));
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-red-50 text-gray-800">

      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-up  { animation: fadeUp 0.7s ease both; }
        .delay-1  { animation-delay: 0.10s; }
        .delay-2  { animation-delay: 0.22s; }
        .delay-3  { animation-delay: 0.34s; }
        .delay-4  { animation-delay: 0.46s; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
        .spinner {
          width: 36px; height: 36px;
          border: 4px solid #fecaca;
          border-top-color: #dc2626;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .step-card { transition: transform 0.2s ease; }
        .step-card:hover { transform: translateY(-4px); }
      `}</style>

      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-red-100 ${
        scrolled ? "bg-white/90 backdrop-blur shadow-sm" : "bg-red-50/80 backdrop-blur"
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 relative">
                <Image src="/images/logo.png" alt="AdoptNest" fill sizes="28px" className="object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight">AdoptNest</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden md:inline-flex items-center justify-center h-10 px-5 rounded-xl bg-red-600 text-white text-sm font-bold tracking-wide hover:bg-red-700 transition-all hover:scale-105 shadow-md shadow-red-200"
              >
                Join Us
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 hover:bg-black/5 transition-colors"
                aria-label="Toggle menu"
              >
                {open ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-72" : "max-h-0"}`}>
          <div className="px-4 pb-4 pt-2 border-t border-red-100 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => { scrollTo(link.href); setOpen(false); }}
                className="text-left rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center h-10 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Join Us
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section id="home" className="py-12 md:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex min-h-[500px] w-full flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl bg-red-600/10 p-8 text-center md:flex-row md:justify-between md:text-left">

              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-red-200/40 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-red-300/30 blur-3xl pointer-events-none" />

              {/* Text */}
              <div className="relative z-10 flex max-w-xl flex-col gap-6 md:pl-8">
                <h1 className="fade-up delay-1 text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  Where every stray<br />
                  <span className="text-red-600">finds a nest.</span>
                </h1>
                <p className="fade-up delay-2 text-lg leading-relaxed text-gray-500">
                  Join us in our mission to provide loving homes for animals in need. Your new best friend is waiting for you.
                </p>
                <div className="fade-up delay-3 flex flex-wrap gap-4 justify-center md:justify-start">
                  <button
                    onClick={() => scrollTo("#adopt")}
                    className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-red-600 text-white text-base font-bold tracking-wide shadow-lg shadow-red-200 hover:bg-red-700 transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    Adopt a Pet
                  </button>
                  <button
                    onClick={() => scrollTo("#rescue")}
                    className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-white text-gray-800 text-base font-bold tracking-wide shadow-sm hover:bg-gray-50 transition-all hover:scale-105 border border-gray-100"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Report a Stray
                  </button>
                </div>
              </div>

              {/* Hero image */}
              <div className="fade-up delay-4 relative w-full max-w-[420px] flex items-center justify-center md:mr-8">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/cat.png"
                    alt="Adorable cat"
                    fill
                    className="object-cover"
                    sizes="420px"
                    priority
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── ADOPT ── */}
        <section id="adopt" className="py-12 md:py-16 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Find Your New Best Friend</h2>
              <p className="mt-2 text-gray-500">Meet some of our adorable residents ready for a forever home.</p>
            </div>

            {/* Loading */}
            {petsLoading && (
              <div className="flex justify-center py-16">
                <div className="spinner" />
              </div>
            )}

            {/* Empty state */}
            {!petsLoading && pets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                <span style={{ fontSize: 48 }}>🐾</span>
                <p className="text-lg font-semibold text-gray-500">No pets available right now.</p>
                <p className="text-sm">Check back soon — new friends are on their way!</p>
              </div>
            )}

            {/* Pet grid — unclickable, just display */}
            {!petsLoading && pets.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {pets.map((pet) => {
                    const imgUrl = getPetImageUrl(pet);
                    const altText = [pet.breed, pet.species].filter(Boolean).join(" - ") || "Animal available for adoption";

                    return (
                      <Link
                        key={pet._id}
                        href="/login"
                        className="card-hover flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 cursor-pointer"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {/* Image area */}
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={altText}
                              fill
                              loading="eager"
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #fee2e2, #fecaca)" }}
                            >
                              <span style={{ fontSize: 52 }}>
                                {pet.species?.toLowerCase().includes("cat") ? "🐱" :
                                 pet.species?.toLowerCase().includes("dog") ? "🐶" : "🐾"}
                              </span>
                            </div>
                          )}

                          <span
                            className="absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(220,252,231,0.95)", color: "#166534" }}
                          >
                            Available
                          </span>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <p className="font-bold text-base text-gray-900 capitalize">{pet.breed || pet.species}</p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {[pet.species, pet.gender, pet.age ? `${pet.age}m` : null].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* View more — takes to login to browse all */}
                <div className="mt-10 flex justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-red-600 text-white text-base font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-md shadow-red-200"
                  >
                    View More Pets
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── RESCUE ── */}
        <section id="rescue" className="py-12 md:py-16 bg-white scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">See an Animal in Need?</h2>
              <p className="mt-2 text-gray-500">Your quick report can save a life. Sign in to submit a report.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">

              {/* CTA card */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-10 text-center gap-6 border border-red-100">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Report a Stray</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Upload a photo, share the location, and describe the animal's condition. Our rescue team will be notified immediately.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-red-600 text-white text-base font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-md shadow-red-200 w-full max-w-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                  </svg>
                  Sign In to Report
                </Link>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 gap-4 content-center">
                {[
                  { num: "01", title: "Spot the Animal",  desc: "Notice a stray or injured animal? Don't walk past — you could save a life." },
                  { num: "02", title: "Upload Details",   desc: "Provide a photo, location, and condition through our easy reporting tool." },
                  { num: "03", title: "We Take Action",   desc: "Our rescue team is notified instantly and dispatched to help." },
                  { num: "04", title: "Track Progress",   desc: "Follow up on the report and get updates on the animal's adoption." },
                ].map((step, i) => (
                  <div key={i} className="step-card flex flex-col gap-2 rounded-xl p-4 bg-red-50 border border-red-100">
                    <span className="text-red-600 font-bold text-lg">{step.num}</span>
                    <h4 className="text-base font-bold">{step.title}</h4>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="py-12 md:py-16 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">About AdoptNest</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              AdoptNest is a community-driven platform connecting rescuers, shelters, and adopters. We make animal rescue and adoption simple, safe, and effective. Every action you take helps give animals a second chance at life.
            </p>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-red-50 py-8 border-t border-red-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2026 AdoptNest. All rights reserved.
        </div>
      </footer>

    </div>
  );
}