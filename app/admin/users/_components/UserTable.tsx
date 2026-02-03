"use client";

import Image from "next/image";
import Link from "next/link";

export interface User {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
  profilePicture?: string | null;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
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
      <table className="min-w-[700px] w-full border border-red-100 rounded-xl bg-white">
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
            <tr key={user._id} className="hover:bg-red-50">
              <td className="px-4 py-3">
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.fullName || ""}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.fullName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
              <td className="px-4 py-3 text-sm flex gap-2">
                <Link
                  href={`/admin/users/${user._id}/edit`}
                  className="text-red-600 hover:text-red-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => alert("Delete functionality coming soon")}
                  className="text-red-600 hover:text-red-800"
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
