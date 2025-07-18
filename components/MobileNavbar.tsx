"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false); // Close the sheet after logout
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/add", label: "Add Memory" },
    { href: "/relationships", label: "Relationships" },
    { href: "/timeline", label: "Timeline" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="grid gap-4 py-4">
          {user && (
            <div className="mb-2 text-sm text-gray-600 font-semibold">{user.email}</div>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button
              variant="outline"
              className="text-lg font-semibold w-full text-left mt-2 rounded-lg border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-sm"
              onClick={handleLogout}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                Logout
              </span>
            </Button>
          ) : (
            <Link
              href="/login"
              className="text-lg font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
