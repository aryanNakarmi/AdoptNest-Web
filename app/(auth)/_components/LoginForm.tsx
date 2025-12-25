"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";

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

    const submit = async (values: LoginData)=>{

        setTransition( async()=>{
            await new Promise((resolve)=> setTimeout(resolve,1000));
        })
        console.log("login", values);
    };

    return(
        <form onSubmit={handleSubmit(submit)}>
            <div className="space-y-4">
                <div className="font-medium">
                    <label htmlFor="email">Email</label>
                    <input type="email"
                    id="email"
                    placeholder="youremail@example.com"
                    autoComplete="email" 
                    className="w-full px-4 h-12 rounded-lg 
                    border border-gray-400
                    text-white
                    focus:border-foreground/30"
                    {...register("email")}/>
                    {errors.email?.message && (
                        <p
                        className="text-xs text-red-600">{errors.email.message}</p>
                    )}
                </div>
                <div className="space-y-1">
                    <label htmlFor="password">
                        Password
                    </label>
                    <input type="password"
                    id="password"
                    autoComplete="current-password"
                    {...register("password")}
                    className="w-full px-4 h-12 rounded-lg 
                    border border-gray-400
                    text-white
                    focus:border-foreground/30"
                    placeholder="******" 
                     />
                    {errors.password?.message && (
                        <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                </div>

                <button
                type="submit"
                disabled= {isSubmitting || pending}
                className="h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                {isSubmitting || pending ? "Logging in..." : "Log in"}
                </button>

                 <div className="mt-1 text-center text-sm">
                Don't have an account? <Link href="/register" className="font-semibold hover:underline">Sign up</Link>
            </div>
            </div>
        </form>
    )

}
