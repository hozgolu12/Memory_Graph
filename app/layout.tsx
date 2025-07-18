import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { MemoryProvider } from '@/contexts/MemoryContext';
import { Toaster } from '@/components/ui/toaster';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BrainBuzz - Map Your Life Experiences',
  description: 'A graph-based memory tracking and journaling tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <MemoryProvider>
            {children}
          </MemoryProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}