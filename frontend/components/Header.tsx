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
import SearchBar from "./SearchBar";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Header() {
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
      <header className="w-full bg-background border-b border-[#DDDDDD] pt-4 pb-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          
          {/* Top Row: Grid layout for perfect centering */}
          <div className="grid grid-cols-3 items-center">
            
            {/* LEFT: Brand Logo */}
            <div className="flex justify-start">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="p-1.5 rounded-xl bg-[#FF385C] text-white group-hover:scale-105 transition-transform">
                  <Home className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[22px] font-bold tracking-tight text-[#FF385C]">
                  stayly
                </span>
              </Link>
            </div>

            {/* CENTER: Exact Airbnb 3D Category Icons & Underline */}
            <div className="flex justify-center">
              <nav className="flex items-center gap-8">
                {/* All */}
                <button
                  onClick={() => setActiveTopTab("all")}
                  className={`flex flex-col items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTopTab === "all"
                      ? "border-[#222222] text-[#222222]"
                      : "border-transparent text-[#717171] hover:border-[#DDDDDD] hover:text-[#222222]"
                  }`}
                >
                  <img
                    src="/icons/all.png"
                    alt="All"
                    className={`w-7 h-7 object-contain transition-opacity ${
                      activeTopTab === "all" ? "opacity-100" : "opacity-60"
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      activeTopTab === "all" ? "font-semibold" : "font-medium"
                    }`}
                  >
                    All
                  </span>
                </button>

                {/* Homes */}
                <button
                  onClick={() => setActiveTopTab("homes")}
                  className={`flex flex-col items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTopTab === "homes"
                      ? "border-[#222222] text-[#222222]"
                      : "border-transparent text-[#717171] hover:border-[#DDDDDD] hover:text-[#222222]"
                  }`}
                >
                  <img
                    src="/icons/homes.png"
                    alt="Homes"
                    className={`w-7 h-7 object-contain transition-opacity ${
                      activeTopTab === "homes" ? "opacity-100" : "opacity-60"
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      activeTopTab === "homes" ? "font-semibold" : "font-medium"
                    }`}
                  >
                    Homes
                  </span>
                </button>

                {/* Experiences */}
                <button
                  onClick={() => setActiveTopTab("experiences")}
                  className={`flex flex-col items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTopTab === "experiences"
                      ? "border-[#222222] text-[#222222]"
                      : "border-transparent text-[#717171] hover:border-[#DDDDDD] hover:text-[#222222]"
                  }`}
                >
                  <img
                    src="/icons/experiences.png"
                    alt="Experiences"
                    className={`w-7 h-7 object-contain transition-opacity ${
                      activeTopTab === "experiences" ? "opacity-100" : "opacity-60"
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      activeTopTab === "experiences" ? "font-semibold" : "font-medium"
                    }`}
                  >
                    Experiences
                  </span>
                </button>

                {/* Services */}
                <button
                  onClick={() => setActiveTopTab("services")}
                  className={`flex flex-col items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
                    activeTopTab === "services"
                      ? "border-[#222222] text-[#222222]"
                      : "border-transparent text-[#717171] hover:border-[#DDDDDD] hover:text-[#222222]"
                  }`}
                >
                  <img
                    src="/icons/services.png"
                    alt="Services"
                    className={`w-7 h-7 object-contain transition-opacity ${
                      activeTopTab === "services" ? "opacity-100" : "opacity-60"
                    }`}
                  />
                  <span
                    className={`text-[13px] ${
                      activeTopTab === "services" ? "font-semibold" : "font-medium"
                    }`}
                  >
                    Services
                  </span>
                </button>
              </nav>
            </div>

            {/* RIGHT: Become a host + Globe + Combined Pill Menu Button */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              {user?.is_host ? (
                <Link
                  href="/host"
                  className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-[#F7F7F7] transition text-[#222222]"
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
                  className="hidden md:block text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-[#F7F7F7] transition text-[#222222]"
                >
                  Airbnb your home
                </Link>
              )}

              <button
                className="p-3 rounded-full hover:bg-[#F7F7F7] transition text-[#222222]"
                aria-label="Language & Region"
              >
                <Globe className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-3 rounded-full hover:bg-[#F7F7F7] transition text-[#222222]"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Combined Menu Pill Button */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="flex items-center gap-3 p-2 px-3 ml-1 border border-[#DDDDDD] rounded-full hover:shadow-md transition bg-background shadow-sm hover:border-[#DDDDDD]">
                    <Menu className="w-4 h-4 text-[#222222]" />
                    <Avatar className="w-8 h-8 -mr-1">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-[#222222] text-white text-xs font-bold">
                        {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 mt-2 shadow-[0_2px_16px_rgba(0,0,0,0.12)] border-none">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-[#DDDDDD] mb-1">
                        <p className="font-semibold text-sm line-clamp-1">{user.name}</p>
                        <p className="text-xs text-[#717171] line-clamp-1">{user.email}</p>
                      </div>

                      <DropdownMenuItem
                        onClick={() => router.push("/trips")}
                        className="cursor-pointer rounded-xl gap-2 py-3 px-4 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                      >
                        Trips
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => router.push("/wishlist")}
                        className="cursor-pointer rounded-xl gap-2 py-3 px-4 text-sm font-semibold text-[#222222] hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                      >
                        Wishlists
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-1 bg-[#DDDDDD]" />

                      {user.is_host && (
                        <DropdownMenuItem
                          onClick={() => router.push("/host")}
                          className="cursor-pointer rounded-xl gap-2 py-3 px-4 text-sm text-[#222222] hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                        >
                          Manage listings
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer rounded-xl gap-2 py-3 px-4 text-sm text-[#222222] hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                      >
                        Log out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => openAuth("login")}
                        className="cursor-pointer font-semibold rounded-xl py-3 px-4 text-sm text-[#222222] hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                      >
                        Log in
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => openAuth("signup")}
                        className="cursor-pointer rounded-xl py-3 px-4 text-sm text-[#222222] hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                      >
                        Sign up
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="my-1 bg-[#DDDDDD]" />

                      <DropdownMenuItem
                        onClick={() => openAuth("signup")}
                        className="cursor-pointer rounded-xl py-3 px-4 text-[#222222] text-sm hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]"
                      >
                        Airbnb your home
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer rounded-xl py-3 px-4 text-[#222222] text-sm hover:bg-[#F7F7F7] focus:bg-[#F7F7F7]">
                        Help Centre
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Row 2: Big 3-Segment Search Bar Centered Directly Below Top Category Icons */}
          <div className="pt-2 pb-2 flex justify-center">
            <SearchBar />
          </div>
        </div>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultMode={authMode} />
    </>
  );
}
