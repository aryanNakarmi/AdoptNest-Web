'use client';

import { ReactNode } from 'react';

export default function AdoptDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
        {children}
      </div>
    </div>
  );
}