"use client";

import Image from "next/image";
import Link from "next/link";

export interface User {
  _id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string | null;
  role: string;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onDelete: (userId: string, userName: string) => void;
}

export default function UserTable({ users, onDelete }: UserTableProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!users || users.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 border border-red-100 rounded-xl bg-red-50">
        No users found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[700px] w-full border border-red-100 rounded-xl bg-white overflow-hidden">
        <thead className="bg-red-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Created
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-red-100">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-red-50 transition">
              <td className="px-4 py-3">
                
              {user.profilePicture ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profilePicture}`}  
                  alt={user.fullName || ""}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">
                    {user.fullName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {user.fullName || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {user.phoneNumber || "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm flex gap-3">
                <Link
                  href={`/admin/users/${user._id}/edit`}
                  className="text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(user._id, user.fullName || user.email)}
                  className="text-red-600 hover:text-red-800 font-medium transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}