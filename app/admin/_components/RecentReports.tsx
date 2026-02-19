"use client";

import Image from "next/image";
import Link from "next/link";
import { HiEye, HiArrowRight } from "react-icons/hi";

interface Report {
  _id: string;
  species: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reportedBy?: {
    fullName: string;
  };
  imageUrl?: string;
}

interface RecentReportsProps {
  reports: Report[];
}

export default function RecentReports({ reports }: RecentReportsProps) {
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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
          <p className="text-sm text-gray-500 mt-1">
            Latest animal reports submitted
          </p>
        </div>
        <Link
          href="/admin/reports"
          className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition"
        >
          View All
          <HiArrowRight size={16} />
        </Link>
      </div>

      {/* Reports List */}
      <div className="divide-y divide-gray-200">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No reports yet</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="p-4 hover:bg-gray-50 transition flex items-center gap-4"
            >
              {/* Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                {report.imageUrl ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${report.imageUrl}`}
                    alt={report.species}
                    fill
                    sizes="48px"
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
                <p className="font-semibold text-gray-900 capitalize truncate">
                  {report.species}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {report.location}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  by {report.reportedBy?.fullName || "Unknown"}
                </p>
              </div>

              {/* Status & Time */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                    report.status
                  )}`}
                >
                  {getStatusText(report.status)}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(report.createdAt)}
                </span>
              </div>

              {/* Action Link */}
              <Link
                href={`/admin/reports`}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <HiArrowRight size={18} />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}