"use client";

import { Mail, Menu, Target, TrendingUp, Trophy, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  activeRoute?:
    | "challenges"
    | "leaderboard"
    | "elo"
    | "invitations"
    | "dashboard";
}

export function DashboardHeader({ activeRoute }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard/challenges",
      label: "Challenges",
      icon: Target,
      key: "challenges",
    },
    {
      href: "/dashboard/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      key: "leaderboard",
    },
    { href: "/dashboard/elo", label: "Your ELO", icon: TrendingUp, key: "elo" },
    {
      href: "/dashboard/invitations",
      label: "Your Invitations",
      icon: Mail,
      key: "invitations",
    },
  ];

  return (
    <header className="border-border border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link className="flex items-center" href="/">
              <Image
                alt="AIPREP"
                className="h-8 w-auto"
                height={32}
                src="/aipreplogo.png"
                width={120}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.key;
                return (
                  <Link
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    href={item.href}
                    key={item.key}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            <Button className="hidden md:flex" size="icon-sm" variant="ghost">
              <Avatar className="size-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>MJ</AvatarFallback>
              </Avatar>
            </Button>

            {/* Mobile menu button */}
            <Button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon-sm"
              variant="ghost"
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="space-y-2 border-border border-t py-4 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.key;
              return (
                <Link
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  href={item.href}
                  key={item.key}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
