"use client";

import { useEffect, useState } from "react";
import { HiUsers } from "react-icons/hi";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

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

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
}

export default function UsersChart() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: createAuthHeader(),
      });

      if (response.data.success) {
        const users = response.data.data || [];
        const totalUsers = users.length;
        const adminUsers = users.filter((u: any) => u.role === "admin").length;
        const regularUsers = totalUsers - adminUsers;

        setStats({
          totalUsers,
          adminUsers,
          regularUsers,
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 flex items-center justify-center min-h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const adminPercent = Math.round((stats.adminUsers / stats.totalUsers) * 100) || 0;
  const regularPercent = Math.round((stats.regularUsers / stats.totalUsers) * 100) || 0;

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HiUsers className="text-purple-600" size={20} />
            User Distribution
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Admin vs Regular users
          </p>
        </div>
      </div>

      {/* Pie Chart Alternative - Bar Display */}
      <div className="space-y-4">
        {/* Admin Users */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Admin</p>
            <span className="text-sm font-bold text-purple-600">
              {stats.adminUsers} ({adminPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${adminPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Regular Users */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Regular Users</p>
            <span className="text-sm font-bold text-blue-600">
              {stats.regularUsers} ({regularPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${regularPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-700">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalUsers}
          </p>
        </div>
      </div>
    </div>
  );
}