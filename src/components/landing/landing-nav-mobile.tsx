"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { Small } from "@/components/ui/typography";

import { LandingNavBrand } from "@/components/landing/landing-nav-brand";

const links = [
  { label: "Product", href: "/landing/product" },
  { label: "Features", href: "/landing/home#features" },
  { label: "Pricing", href: "/landing/home#pricing" },
  { label: "Blog", href: "/landing/resources/blog" },
] as const;

export function LandingNavMobile() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" />}>
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <LandingNavBrand />
          <SheetClose render={<Button variant="ghost" size="icon-sm" />}>
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        <nav className="landing-nav-mobile flex flex-col gap-1 px-4">
          {links.map(({ label, href }) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 transition-colors hover:bg-muted">
              <Small>{label}</Small>
            </Link>
          ))}
        </nav>
        <SheetFooter>
          <Button variant="outline" render={<Link href="/auth/sign-in" />} nativeButton={false}>
            Sign In
          </Button>
          <Button render={<Link href="/auth/sign-up" />} nativeButton={false}>
            Get Started
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
