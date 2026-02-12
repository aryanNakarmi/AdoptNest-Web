"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { HiCheck, HiX, HiEye, HiChevronRight } from "react-icons/hi";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

interface AnimalReport {
  _id: string;
  species: string;
  location: string;
  description?: string;
  imageUrl: string;
  status: "pending" | "approved" | "rejected";
  reportedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith("auth_token=")) {
      return decodeURIComponent(cookie.substring("auth_token=".length));
    }
  }
  return null;
};

const createAuthHeader = () => {
  const token = getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedReport, setSelectedReport] = useState<AnimalReport | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage, selectedFilter]);

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports/all`, {
        params: { page, limit: itemsPerPage },
        headers: createAuthHeader(),
      });

      if (response.data.success) {
        let filtered = response.data.data || [];
        
        if (selectedFilter !== "all") {
          filtered = filtered.filter((r: AnimalReport) => r.status === selectedFilter);
        }
        
        setReports(filtered);
        setTotalPages(response.data.pages || 1);
        setTotalReports(response.data.total || 0);
      } else {
        toast.error("Failed to load reports");
      }
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      const response = await axios.put(
        `${API_URL}/reports/${reportId}/status`,
        { status: "approved" },
        { headers: createAuthHeader() }
      );

      if (response.data.success) {
        toast.success("Report approved");
        setSelectedReport(null);
        fetchReports(currentPage);
      } else {
        toast.error("Failed to approve report");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      const response = await axios.put(
        `${API_URL}/reports/${reportId}/status`,
        { status: "rejected"},
        { headers: createAuthHeader() }
      );

      if (response.data.success) {
        toast.success("Report rejected");
        setSelectedReport(null);
        fetchReports(currentPage);
      } else {
        toast.error("Failed to reject report");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject report");
    } finally {
      setActionLoading(null);
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

  // Calculate the range of items being shown
  const firstItemNumber = (currentPage - 1) * itemsPerPage + 1;
  const lastItemNumber = Math.min(firstItemNumber + itemsPerPage - 1, totalReports);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      {/* Left Side - Reports List */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl shadow overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Animal Reports</h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-4 pt-4 border-b border-gray-200">
          {["pending", "approved", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setSelectedFilter(filter as any);
                setCurrentPage(1);
                setSelectedReport(null);
              }}
              className={`px-4 py-2 font-semibold text-sm transition border-b-2 ${
                selectedFilter === filter
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No {selectedFilter} reports</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <button
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition flex items-center gap-3 ${
                    selectedReport?._id === report._id ? "bg-red-50" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                    {report.imageUrl ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                        alt={report.species}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <HiEye className="text-gray-500" size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 capitalize truncate">
                      {report.species}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {report.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {report.reportedBy?.fullName}
                    </p>
                  </div>

                  {/* Arrow */}
                  <HiChevronRight className="text-gray-400" size={20} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalReports > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 transition"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              Showing <strong className="text-gray-500">{firstItemNumber}-{lastItemNumber}</strong> of <strong className="text-gray-500">{totalReports}</strong> reports
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded border border-gray-300 text-gray-500 hover:bg-white disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Right Side - Detail Panel */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow overflow-hidden flex flex-col">
        {selectedReport ? (
          <>
            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Large Image */}
              <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-200 relative">
                {selectedReport.imageUrl ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${selectedReport.imageUrl}`}
                    alt={selectedReport.species}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <HiEye className="text-gray-500" size={40} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize mb-1">
                  {selectedReport.species}
                </h2>
                <p className="text-gray-600 flex items-center gap-1">
                 {selectedReport.location}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReport.status)}`}>
                  {getStatusText(selectedReport.status)}
                </span>
              </div>

              {/* Description */}
              {selectedReport.description && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedReport.description}</p>
                </div>
              )}

              {/* Reporter Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Reported by</p>
                <p className="font-semibold text-gray-900">{selectedReport.reportedBy?.fullName}</p>
                <p className="text-xs text-gray-500">{selectedReport.reportedBy?.email}</p>
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500">
                {formatDate(selectedReport.createdAt)}
              </div>
            </div>

            {/* Action Buttons - Only show if pending */}
            {selectedReport.status === "pending" && (
              <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => handleApproveReport(selectedReport._id)}
                  disabled={actionLoading === selectedReport._id}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <HiCheck size={18} />
                  Approve
                </button>

                <button
                  onClick={() => handleRejectReport(selectedReport._id)}
                  disabled={actionLoading === selectedReport._id}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <HiX size={18} />
                  Reject
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
            <p className="text-sm">Select a report to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}