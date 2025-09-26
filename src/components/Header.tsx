import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-orange-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo and Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Kubota Logo"
                width={40}
                height={40}
                className="rounded-md"
                priority
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-tight">
                  Asset Management
                </span>
                <span className="text-sm text-orange-100">Kubota Portal</span>
              </div>
            </div>
          </div>

          {/* Right section - Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button
                variant="ghost"
                className="text-white hover:bg-orange-700"
              >
                Support Chat
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant="ghost"
                className="text-white hover:bg-orange-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-orange-700"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
