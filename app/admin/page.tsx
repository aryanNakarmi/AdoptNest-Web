"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {
  HiClipboardList,
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiTrendingUp,
  HiCalendar,
} from "react-icons/hi";
import StatCard from "./_components/StatCard";
import ReportsChart from "./_components/ReportsChart";
import RecentReports from "./_components/RecentReports";
import UsersChart from "./_components/UsersChart";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalUsers: number;
  newUsersThisMonth: number;
  approvalRate: number;
  reportsThisMonth: number;
}

interface RecentReport {
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all reports
      const reportsResponse = await axios.get(`${API_URL}/reports/all`, {
        params: { limit: 100 },
        headers: createAuthHeader(),
      });

      // Fetch all users
      const usersResponse = await axios.get(`${API_URL}/admin/users`, {
        headers: createAuthHeader(),
      });

      if (reportsResponse.data.success && usersResponse.data.success) {
        const reports = reportsResponse.data.data || [];
        const users = usersResponse.data.data || [];

        // Calculate stats
        const totalReports = reports.length;
        const pendingReports = reports.filter(
          (r: any) => r.status === "pending"
        ).length;
        const approvedReports = reports.filter(
          (r: any) => r.status === "approved"
        ).length;
        const rejectedReports = reports.filter(
          (r: any) => r.status === "rejected"
        ).length;

        const totalUsers = users.length;

        // Calculate new users this month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const newUsersThisMonth = users.filter((user: any) => {
          const userDate = new Date(user.createdAt);
          return (
            userDate.getMonth() === currentMonth &&
            userDate.getFullYear() === currentYear
          );
        }).length;

        // Calculate reports this month
        const reportsThisMonth = reports.filter((report: any) => {
          const reportDate = new Date(report.createdAt);
          return (
            reportDate.getMonth() === currentMonth &&
            reportDate.getFullYear() === currentYear
          );
        }).length;

        // Calculate approval rate
        const completedReports = approvedReports + rejectedReports;
        const approvalRate =
          completedReports > 0
            ? Math.round((approvedReports / completedReports) * 100)
            : 0;

        setStats({
          totalReports,
          pendingReports,
          approvedReports,
          rejectedReports,
          totalUsers,
          newUsersThisMonth,
          approvalRate,
          reportsThisMonth,
        });

        // Get 5 most recent reports
        const recent = reports.slice(0, 5);
        setRecentReports(recent);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error: any) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to AdoptNest Admin Panel. Monitor your system at a glance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={stats?.totalReports || 0}
          icon={<HiClipboardList size={24} />}
          color="blue"
          trend={stats?.reportsThisMonth || 0}
          trendLabel="this month"
        />
        <StatCard
          title="Pending"
          value={stats?.pendingReports || 0}
          icon={<HiClock size={24} />}
          color="orange"
          subtext="Awaiting review"
        />
        <StatCard
          title="Approved"
          value={stats?.approvedReports || 0}
          icon={<HiCheckCircle size={24} />}
          color="green"
          subtext={`${stats?.approvalRate || 0}% approval rate`}
        />
        <StatCard
          title="Rejected"
          value={stats?.rejectedReports || 0}
          icon={<HiXCircle size={24} />}
          color="red"
          subtext="Not matching criteria"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<HiUsers size={24} />}
          color="purple"
          trend={stats?.newUsersThisMonth || 0}
          trendLabel="new this month"
        />
        <StatCard
          title="Approval Rate"
          value={`${stats?.approvalRate || 0}%`}
          icon={<HiTrendingUp size={24} />}
          color="indigo"
          subtext="Overall performance"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsChart
  reports={{
    totalReports: stats?.totalReports || 0,
    pendingReports: stats?.pendingReports || 0,
    approvedReports: stats?.approvedReports || 0,
    rejectedReports: stats?.rejectedReports || 0,
  }}
/>

        <UsersChart />
      </div>

      {/* Recent Reports */}
      <RecentReports reports={recentReports} />
    </div>
  );
}