"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Code, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store/useAuth";
import { User, LogOut, LayoutDashboard } from "lucide-react";

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
    const { status: authStatus, user: authUser, logout } = useAuth();
    const isConnected = authStatus === "connected" && !!authUser;

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
                        <span className="text-xl font-black tracking-tighter">CFLYTICS</span>
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
                    <div className="mt-auto pt-8 border-t border-border/50 space-y-4">
                        {isConnected ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Connected</p>
                                        <p className="text-sm font-bold truncate">@{authUser.handle}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                    onClick={() => {
                                        logout();
                                        setOpen(false);
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log out
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest" asChild onClick={() => setOpen(false)}>
                                    <Link href="/dashboard">Guest Mode</Link>
                                </Button>
                                <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20" asChild onClick={() => setOpen(false)}>
                                    <Link href="/connect">Connect</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
