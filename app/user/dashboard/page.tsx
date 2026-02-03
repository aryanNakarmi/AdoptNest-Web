"use client";

import Image from "next/image";
import Link from "next/link";

export default function Page() {
  
  return (
    <div>
      
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <Image src="/images/logo.png" alt="AdoptNest" width={40} height={40} />
          <span className="ml-2 font-bold text-lg">AdoptNest</span>
        </div>
        <div className="flex-1 p-4 space-y-20 text-center">
          <Link href="#" className="block p-2 rounded  ">Dashboard</Link>
       
        </div>
     

    

    </div>
  );
}