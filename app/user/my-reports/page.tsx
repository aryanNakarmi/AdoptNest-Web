"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HiArrowLeft, HiTrash } from "react-icons/hi";
import { toast } from "react-toastify";
import { getMyReports, deleteReport } from "@/lib/api/animal-report/animal-report";

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
    if (!window.confirm(`Are you sure you want to delete the ${reportSpecies} report?`)) {
      return;
    }

    try {
      setDeleting(reportId);
      const response = await deleteReport(reportId);
      
      if (response.success) {
        toast.success("Report deleted successfully");
        // Refresh the page
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold mb-4 transition"
        >
          <HiArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-600 text-sm mt-1">
          You have posted <span className="font-bold text-red-600">{totalReports}</span> animal report{totalReports !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No reports yet</h2>
          <p className="text-gray-600 mb-6">
            Start by creating your first animal report to help animals find their forever homes.
          </p>
          <Link
            href="/user/post"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition"
          >
            Create First Report
          </Link>
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition relative"
              >
                {/* Image */}
                <div className="w-full h-48 relative overflow-hidden bg-gray-200">
                  {report.imageUrl ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                      alt={report.species}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        report.status
                      )}`}
                    >
                      {getStatusText(report.status)}
                    </span>
                  </div>

                  {/* Delete Button - Simple light style */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReport(report._id, report.species);
                    }}
                    disabled={deleting === report._id}
                    className="absolute top-2 left-2 p-1.5 bg-white/70 text-gray-500 rounded hover:bg-white hover:text-gray-700 transition disabled:opacity-50"
                    title="Delete report"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 capitalize text-lg mb-1">
                    {report.species}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mb-2">
                    {report.location}
                  </p>
                  {report.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {report.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatDate(report.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 bg-white rounded-2xl p-4 shadow">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      currentPage === page
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}