"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className=" w-full h-[80vh] flex items-center justify-center px-5 my-10">
      {/* Rounded hero background */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden">
        <Image
          src="/images/dog.jpg" 
          alt="AdoptNest Hero"
          fill
          className="object-cover"
           sizes="100vw"
          priority
        />

        {/* subtle dark */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Where every stray finds a nest.
          </h1>
          <p className="text-lg sm:text-xl mb-6 max-w-2xl">
            Join us in our mission to provide loving homes for animals in need. Your new best friend is waiting.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link
              href="#adopt"
              className="px-6 py-3 rounded-full text-white
              bg-red-600 font-semibold 
              hover:bg-red-400
              hover:text-black
              transition-colors"
            > 
              Adopt a Pet
            </Link>
            <Link
              href="#report"
              className="px-6 py-3 rounded-full bg-gray-800 font-semibold hover:bg-white hover:text-gray-800 transition"
            >
              Report a Stray
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
