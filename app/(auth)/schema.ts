import z from "zod";

export const loginSchema = z.object({
    email: z.email({message:"Enter a valid email"}),
    password: z.string().min(6,{message:"Minimum 6 characters"}),
});