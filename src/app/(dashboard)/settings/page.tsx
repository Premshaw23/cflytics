"use client";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="w-8 h-8" /> Settings
                    </h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <SettingsForm />
            </div>
        </div>
    );
}
