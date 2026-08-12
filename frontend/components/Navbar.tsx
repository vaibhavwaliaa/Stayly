"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Menu, User as UserIcon, Heart, Compass, Home, LogOut, Sun, Moon, PlusCircle } from "lucide-react";
import AuthDialog from "./AuthDialog";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useStore();
  const { theme, setTheme } = useTheme();

  const [activeTopTab, setActiveTopTab] = useState<"all" | "homes" | "experiences" | "services">("all");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#DDDDDD] bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* LEFT: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="p-2 rounded-xl bg-[#FF385C] text-white group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FF385C]">
              stayly
            </span>
          </Link>

          {/* CENTER: Top Category Tabs (All, Homes, Experiences, Services) - Exact Airbnb Header */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveTopTab("all")}
              className={`flex items-center gap-2 pb-1 relative transition-colors ${
                activeTopTab === "all" ? "text-[#222222] font-semibold" : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              <span className="text-lg">🌐</span>
              <span>All</span>
              {activeTopTab === "all" && (
                <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-[#222222] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTopTab("homes")}
              className={`flex items-center gap-2 pb-1 relative transition-colors ${
                activeTopTab === "homes" ? "text-[#222222] font-semibold" : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              <span className="text-lg">🏡</span>
              <span>Homes</span>
              {activeTopTab === "homes" && (
                <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-[#222222] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTopTab("experiences")}
              className={`flex items-center gap-2 pb-1 relative transition-colors ${
                activeTopTab === "experiences" ? "text-[#222222] font-semibold" : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              <span className="text-lg">🎈</span>
              <span>Experiences</span>
              {activeTopTab === "experiences" && (
                <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-[#222222] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTopTab("services")}
              className={`flex items-center gap-2 pb-1 relative transition-colors ${
                activeTopTab === "services" ? "text-[#222222] font-semibold" : "text-[#717171] hover:text-[#222222]"
              }`}
            >
              <span className="text-lg">🛎️</span>
              <span>Services</span>
              {activeTopTab === "services" && (
                <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-[#222222] rounded-full" />
              )}
            </button>
          </nav>

          {/* RIGHT: Become a host + Globe + Combined Pill Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Host Link */}
            {user?.is_host ? (
              <Link
                href="/host"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-muted transition text-[#222222]"
              >
                <PlusCircle className="w-4 h-4 text-[#FF385C]" />
                Switch to hosting
              </Link>
            ) : (
              <Link
                href={user ? "/host" : "#"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    openAuth("login");
                    toast.info("Please log in to become a host");
                  }
                }}
                className="hidden md:block text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-muted transition text-[#222222]"
              >
                Become a host
              </Link>
            )}

            {/* Globe Icon */}
            <button
              className="p-2.5 rounded-full hover:bg-muted transition text-[#717171] hover:text-[#222222]"
              aria-label="Language & Region"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-muted transition text-[#717171] hover:text-[#222222]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* COMBINED Menu Pill Button (Hamburger + Profile in ONE bordered pill) */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button className="flex items-center gap-2.5 p-1.5 pl-3 border border-[#DDDDDD] rounded-full hover:shadow-md transition bg-background shadow-xs">
                  <Menu className="w-4 h-4 text-[#222222]" />
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-muted text-xs font-bold text-[#222222]">
                      {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mt-2 shadow-xl border-[#DDDDDD]">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-[#DDDDDD] mb-1">
                      <p className="font-semibold text-sm line-clamp-1">{user.name}</p>
                      <p className="text-xs text-[#717171] line-clamp-1">{user.email}</p>
                    </div>

                    <DropdownMenuItem
                      onClick={() => router.push("/wishlist")}
                      className="cursor-pointer rounded-xl gap-2 py-2 text-xs font-medium"
                    >
                      <Heart className="w-4 h-4 text-[#FF385C]" />
                      Wishlist
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => router.push("/trips")}
                      className="cursor-pointer rounded-xl gap-2 py-2 text-xs font-medium"
                    >
                      <Compass className="w-4 h-4 text-blue-500" />
                      My Trips
                    </DropdownMenuItem>

                    {user.is_host && (
                      <DropdownMenuItem
                        onClick={() => router.push("/host")}
                        className="cursor-pointer rounded-xl gap-2 py-2 text-xs font-medium"
                      >
                        <Home className="w-4 h-4 text-emerald-500" />
                        Host Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer rounded-xl gap-2 py-2 text-xs text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => openAuth("login")}
                      className="cursor-pointer font-semibold rounded-xl py-2 text-xs"
                    >
                      Log in
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => openAuth("signup")}
                      className="cursor-pointer rounded-xl py-2 text-xs"
                    >
                      Sign up
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={() => openAuth("signup")}
                      className="cursor-pointer rounded-xl py-2 text-[#717171] text-xs"
                    >
                      Become a host
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
      />
    </>
  );
}
