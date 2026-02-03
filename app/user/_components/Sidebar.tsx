"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { href: "/user/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/user/adopt", label: "Adopt", icon: "🐾" },
        { href: "/user/post", label: "Post", icon: "📝" },
        { href: "/user/chat", label: "Chat", icon: "💬" },
        { href: "/user/profile", label: "Profile", icon: "👤" },
        ...(user?.role === "admin" ? [{ href: "/admin/users", label: "Admin Panel", icon: "⚙️" }] : []),
    ];

    return (
        <aside className="w-72 bg-white border-r border-gray-200 fixed h-full">
            <div className="p-6 flex flex-col h-full justify-between">
                {/* Profile Section */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                        {user?.profilePicture ? (
                            <Image
                                src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
                                alt={user.fullName}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-bold">
                                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h1 className="text-gray-900 text-base font-bold">Welcome back</h1>
                            <p className="text-red-600 text-sm font-medium">{user?.fullName || user?.email}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                        isActive
                                            ? 'bg-red-600 text-white'
                                            : 'hover:bg-red-50 text-gray-900'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <p className={`text-sm font-medium`}>{item.label}</p>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 bg-red-600 text-white text-sm font-bold w-full hover:bg-red-700 transition-colors"
                >
                    <span>🚪</span>
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}