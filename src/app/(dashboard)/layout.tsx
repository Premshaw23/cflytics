"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isCompiler = pathname === "/compiler";

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />

                <main className={cn(
                    "flex-1",
                    isCompiler ? "p-0 overflow-hidden" : "p-4 md:p-6 lg:p-10 pb-6 overflow-y-auto"
                )}>
                    <div className={cn(
                        "w-full",
                        isCompiler ? "max-w-none h-full" : "mx-auto max-w-7xl"
                    )}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
