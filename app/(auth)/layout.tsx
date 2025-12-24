export default function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark p-4">
         <header className="absolute top-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 ">
                <h2 className="text-2xl font-bold">AdoptNest</h2>
            </div>
         </header>

        <section>
            {children}
        </section>
        </div>
    );
}