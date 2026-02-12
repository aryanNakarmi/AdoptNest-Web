"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, Fragment, useEffect } from "react";
import { FaPaw } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { getMyReports } from "@/lib/api/animal-report/animal-report";

interface AnimalReport {
  _id: string;
  species: string;
  location: string;
  description?: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getMyReports(1, 4); //euta page ma kati dekhaune 
        
        if (response.success) {
          setReports(response.data || []);
        } else {
          toast.error(response.message || "Failed to load reports");
        }
      } catch (error) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <>
      <div className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg">
        <Image
          src="/images/heropup.jpg"
          alt="Help a stray today"
          fill
           loading="eager"
          sizes="(max-width: 768px) 100vw, 50vw"
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
          <Link
            href="/user/my-posts"
            className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1 transition"
          >
            View All
            <HiArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <p className="text-gray-500 font-medium">No reports yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start by creating your first animal report
            </p>
            <Link
              href="/user/post"
              className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition"
            >
              Create Report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <Link
                key={report._id}
                href={`/user/my-posts/${report._id}`}
                className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition cursor-pointer group"
              >
                {/* IMAGE ON TOP */}
                <div className="w-full h-40 relative overflow-hidden bg-gray-200">
                  {report.imageUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                      alt={report.species}
                      fill

                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}

                  {/* STATUS BADGE */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusText(report.status)}
                    </span>
                  </div>
                </div>

                {/* TEXT BELOW */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 capitalize">
                    {report.species}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    📍 {report.location}
                  </p>
                  {report.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {report.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}