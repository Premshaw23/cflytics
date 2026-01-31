"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
                    <div className="mx-auto max-w-7xl h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
