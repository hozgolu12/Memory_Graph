'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-4 text-center leading-tight">
        Welcome to BrainBuzz
      </h1>
      <p className="text-xl mb-8 text-center max-w-2xl opacity-90">
        Visualize your memories, connect experiences, and explore your personal journey like never before.
      </p>
      <div className="flex space-x-4">
        <Link href="/login" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105">
            Get Started
        </Link>
        <Link href="/login" className="px-8 py-3 border-2 border-white text-white font-bold rounded-full shadow-lg hover:bg-white hover:text-blue-600 transition duration-300 ease-in-out transform hover:scale-105">
            Login
        </Link>
      </div>
    </div>
  );
}
