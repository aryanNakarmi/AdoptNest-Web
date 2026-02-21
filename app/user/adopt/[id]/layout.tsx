import { ReactNode } from "react";

interface AdoptDetailLayoutProps {
  children: ReactNode;
}

export default function AdoptDetailLayout({
  children,
}: AdoptDetailLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  );
}