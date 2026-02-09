// app/user/dashboard/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Fragment } from "react";
import { FaPaw } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reports = [
    {
      id: 1,
      name: "Buddy",
      location: "Kathmandu, Nepal",
      description: "Friendly stray dog found near the park.",
      image: "/images/dogimage.png",
    },
    {
      id: 2,
      name: "Luna",
      location: "Lalitpur, Nepal",
      description: "Young cat rescued from the street.",
      image: "/images/cat.png",
    },
    {
      id: 3,
      name: "Snowy",
      location: "Bhaktapur, Nepal",
      description: "White street dog needs shelter.",
      image: "/images/dog3.jpg",
    },
    {
      id: 4,
      name: "Misty",
      location: "Pokhara, Nepal",
      description: "Stray kitten looking for a home.",
      image: "/images/catty.jpg",
    },
  ];

  return (
    <>
      {/* ===== HERO BANNER (BOTTOM OVERLAY, HALF HEIGHT) ===== */}
      <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg">
        <Image
          src="/images/heropup.jpg"
          alt="Help a stray today"
          fill
          className="object-cover"
        />

        {/* Bottom half overlay only */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/50 flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Help a stray today
          </h1>
          <p className="text-white/90 mb-4 max-w-xl">
            Every small act of kindness makes a huge difference in a life.
          </p>

          {/* Button on bottom-left */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="flex items-center justify-center min-h-screen px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Help a Stray
                </Dialog.Title>

                <Dialog.Description className="mt-2 text-gray-700">
                  Every small act of kindness can save a life! Volunteer, adopt,
                  or donate to local shelters.
                </Dialog.Description>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* ===== ADOPT BAR ===== */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl">
            <FaPaw />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Ready to adopt</h2>
            <p className="text-gray-600 text-sm">
              Browse animals waiting for their forever home
            </p>
          </div>
        </div>
        <Link
          href="/user/adopt"
          className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition"
        >
          Adopt
        </Link>
      </div>

      {/* ===== My Reports Section ===== */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg">My Reports</h2>
          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
            {reports.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {reports.map((animal) => (
            <div
              key={animal.id}
              className="bg-white rounded-2xl overflow-hidden shadow"
            >
              {/* IMAGE ON TOP */}
              <div className="w-full h-40 relative">
                <Image
                  src={animal.image}
                  alt={animal.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* TEXT BELOW */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800">{animal.name}</h3>
                <p className="text-gray-500 text-sm">{animal.location}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {animal.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
