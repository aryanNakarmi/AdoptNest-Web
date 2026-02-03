"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import UserTable from "./_components/UserTable";
import { toast } from "react-toastify";

const DUMMY_USERS = [
    {
        _id: "1",
        email: "john@example.com",
        username: "john_doe",
        fullName: "John Doe",
        role: "admin",
        imageUrl: "/profile_pictures/john.jpg",
        createdAt: "2024-01-15T10:30:00Z"
    },
    {
        _id: "2",
        email: "jane@example.com",
        username: "jane_smith",
        fullName: "Jane Smith",
        role: "user",
        imageUrl: "/profile_pictures/jane.jpg",
        createdAt: "2024-01-20T14:45:00Z"
    },
    {
        _id: "3",
        email: "bob@example.com",
        username: "bob_wilson",
        fullName: "Bob Wilson",
        role: "user",
        createdAt: "2024-02-01T09:15:00Z"
    }
];

export default function Page() {
    const [users, setUsers] = useState(DUMMY_USERS);
    const [loading, setLoading] = useState(false);

    // Uncomment to fetch real users from API
    /*
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                if (response.success) {
                    setUsers(response.data);
                } else {
                    toast.error('Failed to fetch users');
                }
            } catch (error: Error | any) {
                toast.error(error.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);
    */

    if (loading) {
        return <div className="text-center py-8">Loading users...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Users</h1>
                <Link 
                    className="text-blue-500 border border-blue-500 p-2 rounded inline-block hover:bg-blue-50"
                    href="/admin/users/create"
                >
                    Create User
                </Link>
            </div>
            
            <UserTable users={users} />
        </div>
    );
}