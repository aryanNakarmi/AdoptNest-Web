"use client";

import { ToastContainer } from "react-toastify";
import Sidebar from "./_components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 ml-72 bg-gray-50">
          <ToastContainer position="top-right" autoClose={3000} />
          {children}
        </main>
      </div>
    </div>
  );
}
