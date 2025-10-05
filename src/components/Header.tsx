"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, Shield, User, Package } from "lucide-react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

export const Header = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string;

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
            <SignedIn>
              {/* Show asset management link for staff and super_admin users */}
              {(userRole === "super_admin" || userRole === "staff") && (
                <Link href="/asset-management">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-orange-700"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Assets
                  </Button>
                </Link>
              )}

              {/* Show admin link only for super_admin users */}
              {userRole === "super_admin" && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-orange-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Console
                  </Button>
                </Link>
              )}

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>

            <SignedOut>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="text-orange-600 border-white hover:bg-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};
