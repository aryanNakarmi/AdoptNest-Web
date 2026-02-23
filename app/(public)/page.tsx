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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl font-bold text-red-600">{value}</span>
      <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-red-50 text-gray-800"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        html { scroll-behavior: smooth; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up  { animation: fadeUp 0.7s ease both; }
        .delay-1  { animation-delay: 0.10s; }
        .delay-2  { animation-delay: 0.22s; }
        .delay-3  { animation-delay: 0.34s; }
        .delay-4  { animation-delay: 0.46s; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
        .pet-img  { transition: transform 0.35s ease; }
        .pet-card:hover .pet-img { transform: scale(1.08); }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-red-100 ${
        scrolled ? "bg-white/90 backdrop-blur shadow-sm" : "bg-red-50/80 backdrop-blur"
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 relative">
                <Image src="/images/logo.png" alt="AdoptNest" fill sizes="28px" className="object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight">AdoptNest</span>
            </div>

            {/* Desktop nav */}
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

            {/* CTA + hamburger */}
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
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
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

        {/* ── HERO ───────────────────────────────────────── */}
        <section id="home" className="py-12 md:py-24 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex min-h-[500px] w-full flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl bg-red-600/10 p-8 text-center md:flex-row md:justify-between md:text-left">

              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-red-200/40 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-red-300/30 blur-3xl pointer-events-none" />

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

              <div className="fade-up delay-4 relative w-full max-w-[420px] flex items-center justify-center md:mr-8">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/dog.jpg"
                    alt="Adorable pet"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="420px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ADOPT ──────────────────────────────────────── */}
        <section id="adopt" className="py-12 md:py-16 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Find Your New Best Friend</h2>
              <p className="mt-2 text-gray-500">Meet some of our adorable residents ready for a forever home.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[
                { name: "Buddy",  type: "Dog · 2 years",  img: "/images/dogg123.jpg" },
                { name: "Luna",   type: "Cat · 1 year",   img: "/images/catkid.jpg"  },
                { name: "Rocky",  type: "Dog · 4 years",  img: "/images/lalbpup.png" },
                { name: "Daisy",  type: "Cat · 3 years",  img: "/images/kat1.jpg"    },
              ].map((pet, i) => (
                <div key={i} className="pet-card group flex cursor-pointer flex-col gap-3 overflow-hidden rounded-xl p-4 bg-white card-hover border border-gray-100">
                  <div className="relative w-full overflow-hidden rounded-lg aspect-[3/4]">
                    <Image
                      src={pet.img}
                      alt={pet.name}
                      fill
                      className="object-cover pet-img"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold">{pet.name}</p>
                    <p className="text-sm text-gray-500">{pet.type}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-red-600 text-white text-base font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-md shadow-red-200"
              >
                View More Pets
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── RESCUE ─────────────────────────────────────── */}
        <section id="rescue" className="py-12 md:py-16 bg-white scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">See an Animal in Need?</h2>
              <p className="mt-2 text-gray-500">Your quick report can save a life. Let us know where you are.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              {/* Form card */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-8">
                <div className="w-full max-w-md flex flex-col gap-5 text-center">
                  <h3 className="text-xl font-bold">Report a Stray</h3>
                  <p className="text-sm text-gray-500">Upload a photo and share the location. Our team will be notified immediately.</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-200 rounded-xl cursor-pointer hover:bg-red-100/50 transition-colors">
                    <svg className="w-8 h-8 text-gray-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, GIF</p>
                    <input type="file" className="hidden" />
                  </label>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-red-600 text-white text-base font-bold hover:bg-red-700 transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                    </svg>
                    Share Live Location
                  </Link>
                </div>
              </div>

              {/* Steps tiles */}
              <div className="grid grid-cols-2 gap-4 content-center">
                {[
                  {
                    num: "01",
                    title: "Spot the Animal",
                    desc: "Notice a stray or injured animal on the street? Don't walk past — you could save a life.",
                  },
                  {
                    num: "02",
                    title: "Take a Photo",
                    desc: "Snap a clear photo of the animal so our team can assess its condition quickly.",
                  },
                  {
                    num: "03",
                    title: "Submit a Report",
                    desc: "Use our app to file a report with the photo and your current location in seconds.",
                  },
                  {
                    num: "04",
                    title: "We Take Over",
                    desc: "Our volunteers are notified instantly and dispatched to help the animal.",
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-5 card-hover">
                    <span className="text-3xl font-black text-red-200 select-none">{item.num}</span>
                    <p className="font-bold text-sm mt-1 mb-1">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────── */}
        <section id="about" className="py-12 md:py-24 scroll-mt-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Our Commitment to the Community</h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              AdoptNest was founded on a simple principle: every animal deserves a safe and loving home.
              We are a community-powered organization dedicated to rescuing, rehabilitating, and rehoming
              stray and abandoned animals. Through our network of volunteers and partner shelters, we have
              successfully facilitated over 500 adoptions and counting.
            </p>

            <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
              {[
                { step: "01", title: "Browse Animals",  desc: "Explore available animals. Filter by species, breed, age, and location to find your perfect match." },
                { step: "02", title: "Contact Us",      desc: "Found your match? Copy the reference ID and send it through our in-app chat. We respond fast." },
                { step: "03", title: "Welcome Home",    desc: "Complete the adoption and welcome your new family member. A new chapter begins for both of you." },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                  <span className="text-4xl font-black text-red-100 select-none">{item.step}</span>
                  <h3 className="text-lg font-bold mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────── */}
        <section className="py-16 px-6 bg-red-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to change a life?</h2>
            <p className="text-red-100 text-lg mb-8">Join hundreds of families who found their perfect companion through AdoptNest.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-8 py-4 rounded-xl text-base hover:bg-red-50 transition-all hover:scale-105 shadow-xl"
            >
              Get Started — It&apos;s Free
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="bg-white border-t border-red-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 relative shrink-0">
                  <Image src="/images/logo.png" alt="AdoptNest" fill sizes="24px" className="object-contain" />
                </div>
                <span className="text-lg font-bold">AdoptNest</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Giving every animal a second chance.</p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-3 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <button
                        onClick={() => scrollTo(link.href)}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
                <ul className="space-y-2">
                  {["Adoption FAQ", "Pet Care Guide", "Contact Us"].map((item) => (
                    <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-red-600 transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h3>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.149 2 12.315 2zM12 7a5 5 0 100 10A5 5 0 0012 7zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-2.25a.75.75 0 100 1.5.75.75 0 000-1.5z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} AdoptNest. All rights reserved. Made with ♥ for animals.
          </div>
        </div>
      </footer>
    </div>
  );
}