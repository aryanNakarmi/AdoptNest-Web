"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoginData, loginSchema } from "../schema";
import { handleLogin } from "@/lib/actions/auth-action";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm(){

    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit"
    });

    const [pending, setTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

   const { setUser, setIsAuthenticated } = useAuth();

    const submit = async (values: LoginData) => {
    const res = await handleLogin(values);
    if (!res.success) return alert(res.message);

    setUser(res.data); 

    // redirect based on role
    const role = res.data.role?.toLowerCase();
    if (role === "admin") router.replace("/admin");
    else if (role === "user") router.replace("/user/dashboard");
    else router.replace("/");
  };




    return(
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-md">
            <div className="space-y-3 w-full">
           

                {/* Heading */}
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
                    <p className="text-gray-600 text-sm">Log in to your account</p>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900">Email</label>
                    <input type="email"
                    id="email"
                    placeholder="yourname@example.com"
                    autoComplete="email" 
                    className="w-full px-4 h-12 rounded-full 
                    border-2 border-gray-300
                    text-gray-900
                    text-sm
                    placeholder:text-gray-500
                    focus:border-orange-400
                    focus:outline-none
                    transition-colors"
                    {...register("email")}/>
                    <div className="h-3">
                    {errors.email?.message && (
                        <p className="text-xs text-red-600">{errors.email.message}</p>
                    )}
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-medium text-gray-900">
                            Password
                        </label>
                      
                    </div>
                    <input type="password"
                    id="password"
                    autoComplete="current-password"
                    {...register("password")}
                    className="w-full px-4 h-12 rounded-full 
                    border-2 border-gray-300
                    text-gray-900
                    text-sm
                    placeholder:text-gray-500
                    focus:border-orange-400
                    focus:outline-none
                    transition-colors"
                    placeholder="Enter your password" 
                    />
                    <div className="h-3">
                    {errors.password?.message && (
                        <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                    </div>
                </div>

                {/* Login Button */}
                <button
                type="submit"
                disabled={isSubmitting || pending}
                className="h-12 w-full rounded-full text-white text-base font-bold hover:opacity-90 disabled:opacity-60 transition-colors mt-3 shadow-lg"
                style={{backgroundColor: '#FF8C69'}}>
                {isSubmitting || pending ? "Logging in..." : "Login"}
                </button>


                {/* Sign Up Link */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link href="/register" className="font-bold text-orange-500 hover:underline">Sign Up</Link>
                </div>
            </div>
        </form>
    )
}