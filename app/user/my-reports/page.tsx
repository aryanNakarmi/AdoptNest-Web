"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiArrowLeft, HiTrash, HiX, HiCalendar } from "react-icons/hi";
import { toast } from "react-toastify";
import { getMyReports, deleteReport } from "@/lib/api/animal-report/animal-report";
import { HiMapPin } from "react-icons/hi2";

interface AnimalReport {
  _id: string;
  species: string;
  location: string;
  description?: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<AnimalReport | null>(null);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      const response = await getMyReports(page, itemsPerPage);

      if (response.success) {
        setReports(response.data || []);
        setTotalPages(response.pages || 1);
        setTotalReports(response.total || 0);
      } else {
        toast.error(response.message || "Failed to load reports");
        setReports([]);
      }
    } catch (error) {
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string, reportSpecies: string) => {
    if (!window.confirm(`Are you sure you want to delete the ${reportSpecies} report?`)) return;

    try {
      setDeleting(reportId);
      const response = await deleteReport(reportId);

      if (response.success) {
        toast.success("Report deleted successfully");
        if (selectedReport?._id === reportId) setSelectedReport(null);
        fetchReports(currentPage);
      } else {
        toast.error(response.message || "Failed to delete report");
      }
    } catch (error) {
      toast.error("Failed to delete report");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200 text-green-700";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-orange-50 border-orange-200 text-orange-700";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusText = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold mb-4 transition"
        >
          <HiArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="text-4xl font-bold text-gray-900">My Reports</h1>
          <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full font-semibold text-sm">
            {totalReports} report{totalReports !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-gray-600 mt-2">Track and manage your animal reports here</p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-12 text-center border border-red-100 shadow-sm">
          <div className="mb-4">
            <div className="inline-block p-4 bg-white rounded-full">
              <HiTrash size={40} className="text-gray-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No reports yet</h2>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Start creating animal reports to help us locate and assist animals in need.
          </p>
          <Link
            href="/user/post"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition shadow-lg"
          >
            Create Your First Report
          </Link>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedReport(report)}
              >
                {/* Image Container */}
                <div className="w-full h-48 relative overflow-hidden bg-gray-200">
                  {report.imageUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                      alt={report.species}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="text-gray-500 text-sm font-medium">No image</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReport(report._id, report.species);
                    }}
                    disabled={deleting === report._id}
                    className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-red-600 text-gray-600 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 shadow-sm"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 capitalize text-base mb-1 line-clamp-1">
                    {report.species}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                    <HiMapPin size={14} />
                    <span className="line-clamp-1">{report.location}</span>
                  </p>
                  {report.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                      {report.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <HiCalendar size={12} />
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition font-medium text-sm"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page <strong className="text-gray-900">{currentPage}</strong> of{" "}
                <strong className="text-gray-900">{totalPages}</strong>
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition font-medium text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200"
          onClick={() => setSelectedReport(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 duration-300 flex flex-col"
          >
            {/* Image Section - Top with Close Button */}
            <div className="w-full h-96 relative overflow-hidden bg-gray-200 flex-shrink-0">
              {selectedReport.imageUrl ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${selectedReport.imageUrl}`}
                  alt={selectedReport.species}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="eager"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Close Button - Top Right */}
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-red-600 text-gray-700 hover:text-white rounded-full transition-all duration-200 shadow-lg"
              >
                <HiX size={24} />
              </button>

              {/* Status Badge - Bottom Left */}
              <div className="absolute bottom-4 left-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedReport.status)}`}>
                  {getStatusText(selectedReport.status)}
                </span>
              </div>
            </div>

            {/* Content Section - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <h2 className="text-3xl font-bold capitalize text-gray-900 mb-2">{selectedReport.species}</h2>

              <div className="flex items-center gap-2 text-gray-600 mb-6 font-medium">
                <HiMapPin size={20} className="text-red-600" />
                {selectedReport.location}
              </div>

              {selectedReport.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 flex items-center gap-2 text-sm text-gray-500">
                <HiCalendar size={16} />
                Posted on <strong className="text-gray-900">{formatDate(selectedReport.createdAt)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}