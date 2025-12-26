import Image from "next/image";

export default function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        
        <div className="relative flex min-h-screen w-full items-center justify-center bg-black p-4">
            
   

         {/* <div className="grid w-full max-w-4xl grid-cols-1 rounded-xl
        md:grid-cols-2 
        border
        border-white/40
         h-[650]
         ">
         */}
        <div className="
          grid w-full max-w-4xl grid-cols-1 md:grid-cols-2
          rounded-2xl
          h-[650px]
          relative
          shadow-[0_0_30px_10px_rgba(255,255,255,.2)]
        ">

        <div className="relative hidden md:block rounded-l-xl overflow-hidden ">
          <Image
            src="/images/ima.png"
            alt="pet image"
            fill
            className="object-cover "
          />
        </div>


        <div className="flex flex-col items-center justify-center p-8 sm:p-12">
          {children}
        </div>

      </div>
        </div>
    );
}