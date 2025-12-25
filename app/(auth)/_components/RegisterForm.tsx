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
                <div className="text-sm ">
                    <label htmlFor="email">Email</label>
                    <input type="email"
                    id="email"
                    placeholder="youremail@example.com"
                    autoComplete="email" 
                    className="w-full px-4 h-10 rounded-lg 
                    border border-white/15
                    text-white
                    text-sm
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
                    <label htmlFor="name" className="text-sm">Full name</label>
                    <input type="text"
                    id="name"
                    placeholder="your name"
                    autoComplete="name" 
                    className="w-full px-4 h-10 rounded-lg 
                    border border-white/15
                    text-white
                    focus:border-foreground/30
                    text-sm"
                    {...register("name")}/>
                    <div className="h-4">
                    {errors.name?.message && (

                        <p
                        className="text-xs text-red-600">{errors.name.message}</p>
                    )}

                    </div>
                </div>
                
            
                <div className="space-y-1">
                    <label htmlFor="password" className="text-sm">
                        Password
                    </label>
                    <input type="password"
                    id="password"
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full px-4 h-10 rounded-lg 
                    border border-white/15
                    text-white
                    focus:border-foreground/30
                    text-sm"
                    placeholder="******" 
                     />
                     <div className="h-4">

                    {errors.password?.message && (
                        <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                    </div>
                </div>
            
                <div className="space-y-1">
                    <label htmlFor="password" className="text-sm">
                        Confirm Password
                    </label>
                    <input type="password"
                    id="confirmpassword"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className="w-full px-4 h-10 rounded-lg 
                    border border-white/15
                    text-white
                    focus:border-foreground/30
                    text-sm"
                    placeholder="******" 
                     />
                     <div className="h-4">

                    {errors.confirmPassword?.message && (
                        <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                    )}
                    </div>
                </div>

                <button
                type="submit"
                disabled= {isSubmitting || pending}
                className="h-10 w-full rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                {isSubmitting || pending ? "Creating account..." : "Register"}
                </button>

                 <div className="mt-1 text-center text-sm">
                Already have an account? <Link href="/login" className="font-semibold hover:underline">Log in</Link>
            </div>
            </div>
        </form>
    )

}