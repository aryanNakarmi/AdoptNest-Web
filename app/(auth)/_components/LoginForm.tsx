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
            <div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email"
                    id="email"
                    autoComplete="email" 
                    {...register("email")}/>
                    {errors.email?.message && (
                        <p
                        className="text-xs text-red-600">{errors.email.message}</p>
                    )}
                </div>
            </div>
        </form>
    )

}
