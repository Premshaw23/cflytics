"use client";

import { usePreferences } from "@/lib/store/usePreferences";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Save } from "lucide-react";

export function SettingsForm() {
    const preferences = usePreferences();
    const { setTheme } = useTheme(); // use next-themes

    const [handle, setHandle] = useState(preferences.defaultHandle);

    const handleSave = () => {
        preferences.setDefaultHandle(handle);
        // Toast or feedback
    };

    return (
        <div className="space-y-6">
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your default profile and display names.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Default Codeforces Handle</Label>
                        <div className="flex gap-2">
                            <Input
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="Your CF Handle"
                            />
                            <Button onClick={handleSave} className="shrink-0">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This handle will be pre-filled in search fields and used for personalized recommendations.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the interface look and feel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Theme</Label>
                        <Select
                            defaultValue="system"
                            onValueChange={(val: any) => {
                                setTheme(val);
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>Problem Display</CardTitle>
                    <CardDescription>Configure how problems are shown across the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Show Problem Tags</Label>
                            <p className="text-sm text-muted-foreground">Toggle visibility of problem topics.</p>
                        </div>
                        <Switch
                            checked={preferences.showTags}
                            onCheckedChange={preferences.toggleShowTags}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
