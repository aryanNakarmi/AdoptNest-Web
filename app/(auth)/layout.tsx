import Image from "next/image";

export default function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        
        <div className="relative flex min-h-screen w-full items-center justify-center bg-black p-4">
            
   

         <div className="grid w-full max-w-4xl grid-cols-1 rounded-xl bg-white/50 dark:bg-black/20 shadow-lg ring-1 ring-black/5 md:grid-cols-2 border
         h-[650]
         ">
        
 
        <div className="relative hidden md:block rounded-l-xl overflow-hidden ">
          <Image
            src="/images/catpic.jpg"
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