"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Code,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <nav
            aria-label="Main Navigation"
            className={cn(
                "relative hidden lg:flex flex-col h-screen border-r bg-card transition-all duration-300",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b">
                <Link href="/" className="flex items-center space-x-2 overflow-hidden">
                    <div className="min-w-[32px] w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <Code className="text-primary-foreground w-5 h-5" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold tracking-tight whitespace-nowrap">Codey</span>
                    )}
                </Link>
            </div>

            <div
                className="flex-1 overflow-y-auto py-6 px-3 space-y-1"
                role="list"
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            role="listitem"
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group relative",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground"
                            )}
                        >
                            <item.icon aria-hidden="true" className={cn("w-5 h-5 shrink-0", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                            {!isCollapsed && (
                                <span className="text-sm font-semibold tracking-wide">{item.title}</span>
                            )}
                            {isCollapsed && (
                                <div role="tooltip" className="absolute left-14 bg-zinc-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-3 border-t space-y-1">
                <Link
                    href="/settings"
                    role="link"
                    aria-current={pathname === "/settings" ? "page" : undefined}
                    className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground transition-all group relative",
                        pathname === "/settings" && "bg-zinc-100 dark:bg-zinc-800 text-foreground"
                    )}
                >
                    <Settings aria-hidden="true" className="w-5 h-5 shrink-0 group-hover:rotate-45 transition-transform" />
                    {!isCollapsed && <span className="text-sm font-semibold tracking-wide">Settings</span>}
                </Link>

                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!isCollapsed}
                    className="w-full h-10 mt-2 justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </Button>
            </div>
        </nav>
    );
}
