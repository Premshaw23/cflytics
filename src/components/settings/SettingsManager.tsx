"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Settings,
    User,
    Moon,
    Sun,
    Monitor,
    Download,
    Save,
    CheckCircle2,
    Bell,
    Globe
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export function SettingsManager() {
    const { theme, setTheme } = useTheme();
    const [handle, setHandle] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [displayMode, setDisplayMode] = useState<"card" | "table">("table");
    const [refreshInterval, setRefreshInterval] = useState("30");

    useEffect(() => {
        const savedHandle = localStorage.getItem("codey_active_handle");
        if (savedHandle) setHandle(savedHandle);

        const savedMode = localStorage.getItem("codey_problem_display_mode") as "card" | "table";
        if (savedMode) setDisplayMode(savedMode);

        const savedInterval = localStorage.getItem("codey_refresh_interval");
        if (savedInterval) setRefreshInterval(savedInterval);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        // Persist all settings
        localStorage.setItem("codey_active_handle", handle);
        localStorage.setItem("codey_problem_display_mode", displayMode);
        localStorage.setItem("codey_refresh_interval", refreshInterval);

        setTimeout(() => {
            setIsSaving(false);
            toast.success("Settings saved successfully!");
        }, 800);
    };

    const handleExport = () => {
        const data = {
            handle: localStorage.getItem("codey_active_handle"),
            theme: theme,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `codey-settings-${handle || 'dev'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground font-medium">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Profile Settings
                        </CardTitle>
                        <CardDescription>Your public identity on Codey.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="handle">Default Codeforces Handle</Label>
                            <Input
                                id="handle"
                                placeholder="Enter your handle"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                This handle will be used as the default for your dashboard and profile.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 border-t py-3">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Appearance & Layout */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sun className="w-5 h-5 text-primary" /> Appearance & Layout
                        </CardTitle>
                        <CardDescription>Customize how Codey looks and behaves.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Theme Mode</span>
                                <span className="text-[11px] text-muted-foreground">Light, dark, or system.</span>
                            </div>
                            <div className="flex gap-1 p-1 bg-muted/30 rounded-md border border-border/50">
                                <Button
                                    variant={theme === "light" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setTheme("light")}
                                    className="h-8 px-3"
                                >
                                    <Sun className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={theme === "dark" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setTheme("dark")}
                                    className="h-8 px-3"
                                >
                                    <Moon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={theme === "system" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setTheme("system")}
                                    className="h-8 px-3"
                                >
                                    <Monitor className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Problem Display Mode */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Problem List View</span>
                                <span className="text-[11px] text-muted-foreground">Default display style for problems.</span>
                            </div>
                            <div className="flex gap-1 p-1 bg-muted/30 rounded-md border border-border/50">
                                <Button
                                    variant={displayMode === "table" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setDisplayMode("table")}
                                    className="h-8 px-4 text-xs font-bold"
                                >
                                    Table
                                </Button>
                                <Button
                                    variant={displayMode === "card" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setDisplayMode("card")}
                                    className="h-8 px-4 text-xs font-bold"
                                >
                                    Cards
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Synchronization */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" /> Sync & Alerts
                        </CardTitle>
                        <CardDescription>Manage how Codey updates your data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="contests" className="flex flex-col space-y-1">
                                <span className="font-bold">Contest Reminders</span>
                                <span className="font-normal text-[11px] text-muted-foreground">Notify me before contests start.</span>
                            </Label>
                            <Switch
                                id="contests"
                                checked={notifications}
                                onCheckedChange={setNotifications}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Data Auto-Refresh</Label>
                            <select
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="5">Every 5 minutes</option>
                                <option value="15">Every 15 minutes</option>
                                <option value="30">Every 30 minutes</option>
                                <option value="60">Every hour</option>
                                <option value="0">Manual refresh only</option>
                            </select>
                            <p className="text-[11px] text-muted-foreground">Higher frequency may increase API usage.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            < Globe className="w-5 h-5 text-primary" /> Data Management
                        </CardTitle>
                        <CardDescription>Backup or clear your local application data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport}>
                            <Download className="w-4 h-4" />
                            Export Data (.json)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
