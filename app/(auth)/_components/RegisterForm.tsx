"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { RegisterData, registerSchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import Link from "next/link";

export default function RegisterForm(){
    const router = useRouter();
    const{
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });
    const [pending, setTransition] = useTransition();

    const submit = async(values:RegisterData)=>{
        setTransition(async ()=>{
            await new Promise((resolve)=>setTimeout(resolve,1000));
            router.push("/login");
        })
        //go to login page
        console.log("register",values);
    }
    return (
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
                    <div className="h-4">
                    {errors.email?.message && (

                        <p
                        className="text-xs text-red-600">{errors.email.message}</p>
                    )}

                    </div>
                </div>
                <div className="space-y-1">
                    <label htmlFor="name">Full Name</label>
                    <input type="text"
                    id="name"
                    placeholder="Your Name"
                    autoComplete="name" 
                    className="w-full px-4 h-12 rounded-lg 
                    border border-gray-400
                    text-white
                    focus:border-foreground/30"
                    {...register("name")}/>
                    <div className="h-4">
                    {errors.email?.message && (

                        <p
                        className="text-xs text-red-600">{errors.email.message}</p>
                    )}

                    </div>
                </div>
                
            
                <div className="space-y-1">
                    <label htmlFor="password">
                        Password
                    </label>
                    <input type="password"
                    id="password"
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full px-4 h-12 rounded-lg 
                    border border-gray-400
                    text-white
                    focus:border-foreground/30"
                    placeholder="******" 
                     />
                     <div className="h-4">

                    {errors.password?.message && (
                        <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                    </div>
                </div>
            
                <div className="space-y-1">
                    <label htmlFor="password">
                        Confirm Password
                    </label>
                    <input type="password"
                    id="confirmpassword"
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full px-4 h-12 rounded-lg 
                    border border-gray-400
                    text-white
                    focus:border-foreground/30"
                    placeholder="******" 
                     />
                     <div className="h-4">

                    {errors.password?.message && (
                        <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                    </div>
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