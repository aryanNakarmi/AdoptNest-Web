"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./_components/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login"); 
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Toast notifications */}
          <ToastContainer position="top-right" autoClose={3000} />

          {/* Page content */}
          {children}
        </div>
      </main>
    </div>
  );
}
