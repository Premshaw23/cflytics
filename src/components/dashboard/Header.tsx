"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, Code } from "lucide-react";
import { navItems } from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store/useAuth";
import { useEffect } from "react";
import { toast } from "sonner";

export function Header() {
    const [search, setSearch] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const authStatus = useAuth((s) => s.status);
    const authUser = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);
    const isConnected = authStatus === "connected" && !!authUser;
    const connectedHandle = isConnected ? (authUser.handle ?? "") : "";

    const [activeHandle, setActiveHandle] = useState<string>("");

    useEffect(() => {
        const update = () => {
            const current = localStorage.getItem("codey_active_handle") || "";
            setActiveHandle(current);
        };

        const id = setTimeout(update, 0);
        window.addEventListener("storage", update);
        return () => {
            clearTimeout(id);
            window.removeEventListener("storage", update);
        };
    }, []);

    const isViewingOther =
        !!connectedHandle &&
        !!activeHandle &&
        connectedHandle.toLowerCase() !== activeHandle.toLowerCase();

    const backToMyHandle = () => {
        if (!connectedHandle) return;
        localStorage.setItem("codey_active_handle", connectedHandle);
        window.dispatchEvent(new Event("storage"));
        router.refresh();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/profile/${search.trim()}`);
            setSearch("");
        }
    };

    return (
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0" aria-describedby="header-mobile-menu-description">
                        <SheetHeader className="h-16 border-b px-6 flex flex-row items-center gap-2 space-y-0 text-left">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Code className="text-primary-foreground w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <SheetTitle className="text-xl font-bold tracking-tight">Codey</SheetTitle>
                                <SheetDescription id="header-mobile-menu-description" className="sr-only">
                                    Mobile navigation menu for Codey dashboard
                                </SheetDescription>
                            </div>
                        </SheetHeader>
                        <div className="py-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-64px)]">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-semibold">{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <form onSubmit={handleSearch} className="relative group" role="search">
                    <label htmlFor="header-search" className="sr-only">Search Codeforces handle</label>
                    <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                        id="header-search"
                        type="text"
                        placeholder="Search handle..."
                        className="pl-10 h-10 w-full bg-zinc-100/50 dark:bg-zinc-800/50 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
                {isViewingOther && (
                    <div className="hidden md:flex items-center gap-2">
                        <Badge variant="outline" className="font-bold">
                            Viewing <span className="text-primary">@{activeHandle}</span>
                        </Badge>
                        <Button
                            variant="secondary"
                            className="h-9 font-bold"
                            onClick={backToMyHandle}
                            title={`Back to your handle (@${connectedHandle})`}
                        >
                            Back to @${connectedHandle}
                        </Button>
                    </div>
                )}
                <ThemeToggle />

                <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-border/50 relative"
                    onClick={() => toast.message("Notifications coming soon")}
                    title="Notifications (coming soon)"
                >
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border-border/50">
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="space-y-1">
                            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                {isConnected ? "Connected" : "Guest Mode"}
                            </div>
                            <div className="text-sm font-bold">
                                {isConnected ? `@${authUser.handle}` : "Not connected"}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/")}>
                            Home
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                            Profile
                        </DropdownMenuItem>
                        {isViewingOther && (
                            <DropdownMenuItem onClick={backToMyHandle}>
                                Back to @{connectedHandle}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => router.push("/settings")}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/connect")}>
                            {isConnected ? "Manage Connection" : "Connect Account"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isConnected && (
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={async () => {
                                    await logout();
                                    router.push("/");
                                }}
                            >
                                Disconnect
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
