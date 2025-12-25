"use client";

import RegisterForm from "../_components/RegisterForm";



export default function Page() {
    return (
        <div className="space-y-6 w-full">
            <div className="text-center">
                <h1 className="text-2xl font-semibold">Create your account</h1>
                <p>Join our community and find your new friend</p>
            </div>
            <RegisterForm/>

        </div>
    );
}