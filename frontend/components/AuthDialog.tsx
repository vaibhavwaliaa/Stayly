"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch, ApiError } from "@/lib/api";
import { useStore } from "@/lib/store";
import type { TokenResponse } from "@/lib/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
}

export default function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
}: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isHost, setIsHost] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setIsHost(false);
  };

  const handleModeSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await apiFetch<TokenResponse>("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setAuth(data.user, data.access_token);
        toast.success(`Welcome back, ${data.user.name}!`);
        onOpenChange(false);
        resetForm();
      } else {
        const data = await apiFetch<TokenResponse>("/auth/register", {
          method: "POST",
          body: { name, email, password, is_host: isHost },
        });
        setAuth(data.user, data.access_token);
        toast.success(`Account created! Welcome to Stayly, ${data.user.name}.`);
        onOpenChange(false);
        resetForm();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail || "Authentication failed");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-2xl">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-center text-lg font-bold">
            {mode === "login" ? "Log in to Stayly" : "Sign up for Stayly"}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {mode === "login"
              ? "Enter your email and password to access your account."
              : "Create an account to start booking or hosting places."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {mode === "signup" && (
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="isHost"
                checked={isHost}
                onCheckedChange={(checked) => setIsHost(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="isHost" className="text-sm font-normal cursor-pointer">
                I want to list my property as a Host
              </Label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#E9385C] hover:bg-[#D02B4C] text-white font-semibold py-2.5 rounded-lg transition mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "Log In"
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="pt-4 border-t text-center text-sm">
          {mode === "login" ? (
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className="font-semibold text-foreground underline hover:text-[#E9385C]"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className="font-semibold text-foreground underline hover:text-[#E9385C]"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
