"use client";
import Link from "next/link";
import Image from "next/image";

export default function AuthDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <Image src="/images/logo.png" alt="AdoptNest" height={40} width={40} />
          <span className="ml-2 font-bold text-lg text-gray-800 dark:text-white">AdoptNest</span>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/adoptions" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                My Adoptions
              </Link>
            </li>
            <li>
              <Link href="/dashboard/bookings" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Bookings
              </Link>
            </li>
            <li>
              <Link href="/dashboard/profile" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/logout" className="block px-4 py-2 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-700">
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {/* Example user icon */}
              <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
