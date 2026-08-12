"use client";

import { useState, useEffect } from "react";
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
import { Search, Globe, Menu, User as UserIcon, Heart, Compass, Home, LogOut, Sun, Moon, PlusCircle } from "lucide-react";
import AuthDialog from "./AuthDialog";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useStore();
  const { theme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Scroll listener for compact search pill cross-fade (>120px)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 120) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <header className="sticky top-0 z-40 w-full border-b border-[#DDDDDD] bg-background transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* LEFT: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-[#FF385C] text-white group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FF385C]">
              stayly
            </span>
          </Link>

          {/* CENTER: Compact Search Pill (Cross-fades IN only when scrollY >= 120px) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`cursor-pointer inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#DDDDDD] shadow-xs hover:shadow-md transition-all duration-200 bg-background ${
              scrolled
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            <span className="font-semibold text-xs text-[#222222]">Anywhere</span>
            <span className="h-4 w-px bg-[#DDDDDD]"></span>
            <span className="font-semibold text-xs text-[#222222]">Any week</span>
            <span className="h-4 w-px bg-[#DDDDDD]"></span>
            <span className="text-xs text-[#717171] hidden sm:inline">Add guests</span>
            <div className="p-2 bg-[#FF385C] text-white rounded-full ml-1">
              <Search className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* RIGHT: Become a host + Globe + Combined Pill Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
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
