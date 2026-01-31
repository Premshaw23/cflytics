"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Code,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <motion.nav
            initial={false}
            animate={{ width: isCollapsed ? 80 : 260 }}
            className="hidden lg:flex flex-col h-screen border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 z-50 shrink-0 relative overflow-hidden"
        >
            {/* Header / Logo Area */}
            <div className="h-auto py-4 flex items-center px-6 shrink-0">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-zinc-900/10 dark:shadow-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
                        <Image
                            src="/logo.png"
                            alt="Codey Logo"
                            width={32}
                            height={32}
                            className="w-7 h-7 rounded-2xl object-fill z-100"
                            priority
                        />
                    </div>
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white whitespace-nowrap"
                            >
                                CODEY
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-1.5 scrollbar-none">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-3 rounded-xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-transform duration-300",
                                        isActive ? "scale-105" : "group-hover:scale-110"
                                    )}
                                />
                            </div>

                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, visibility: "hidden" }}
                                    animate={{ opacity: 1, visibility: "visible" }}
                                    className="ml-4 text-sm font-bold tracking-tight whitespace-nowrap"
                                >
                                    {item.title}
                                </motion.span>
                            )}

                            {isCollapsed && (
                                <div className="fixed left-[90px] px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-2xl z-[100] whitespace-nowrap ml-[-10px] group-hover:ml-0">
                                    {item.title}
                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-zinc-900 border-l border-b border-zinc-200 dark:border-white/10 rotate-45" />
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-white/5 space-y-1.5 shrink-0 bg-white dark:bg-zinc-950">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center px-3 py-3 rounded-xl transition-all group relative",
                        pathname === "/settings"
                            ? "bg-zinc-900 dark:bg-zinc-900 text-white"
                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    )}
                >
                    <div className="flex items-center justify-center w-6 h-6 shrink-0">
                        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                    </div>
                    {!isCollapsed && <span className="ml-4 text-sm font-bold tracking-tight">Settings</span>}
                    {isCollapsed && (
                        <div className="fixed left-[90px] px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 shadow-2xl z-[100] whitespace-nowrap ml-[-10px] group-hover:ml-0">
                            Settings
                        </div>
                    )}
                </Link>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center w-full px-3 py-3 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-all group"
                >
                    <div className="flex items-center justify-center w-6 h-6 shrink-0">
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </div>
                    {!isCollapsed && <span className="ml-4 text-sm font-bold tracking-tight">Collapse</span>}
                </button>
            </div>
        </motion.nav>
    );
}
