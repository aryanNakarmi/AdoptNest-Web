import Image from "next/image";

export default function ResetPasswordLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="relative flex min-h-screen w-full bg-white">
            {/* Left side - Hero with image and text (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-900 to-orange-800 flex-col justify-between p-16 text-white">
                <div className="absolute inset-0">
                    <Image
                        src="/images/dog1.jpg"
                        alt="pet image"
                        fill
                        className="object-cover opacity-80"
                    />
                </div>
                
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    <h2 className="text-4xl font-bold leading-tight">Find your new best friend.</h2>
                    <p className="text-lg text-white/90">Join thousands of families who have found their forever friends through AdoptNest.</p>
                </div>
            </div>

            {/* Right side - Form (centered on mobile, full width) */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen lg:min-h-auto">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}