"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Code, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
    title: string;
    href: string;
}

interface MobileNavProps {
    items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r-border/50 bg-background/95 backdrop-blur-xl" aria-describedby="mobile-nav-description">
                <SheetHeader className="mb-8">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                            <Code className="text-primary-foreground w-5 h-5" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">CODEY</span>
                    </SheetTitle>
                    <SheetDescription id="mobile-nav-description">
                        Master the competitive programming algorithms.
                    </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center justify-between px-4 py-4 rounded-2xl text-lg font-bold transition-all",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {item.title}
                            <ExternalLink className="w-4 h-4 opacity-30" />
                        </Link>
                    ))}
                    <div className="mt-8 pt-8 border-t border-border/50">
                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest" asChild onClick={() => setOpen(false)}>
                            <Link href="/dashboard">Get Started</Link>
                        </Button>
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
