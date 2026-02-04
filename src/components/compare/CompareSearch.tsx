"use client";

import React, { useState, useEffect } from 'react';
import { Search, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface CompareSearchProps {
    onCompare: (handle1: string, handle2: string) => void;
}

export function CompareSearch({ onCompare }: CompareSearchProps) {
    const [handle1, setHandle1] = useState('');
    const [handle2, setHandle2] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem("cflytics_active_handle");
        if (saved) setHandle1(saved);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (handle1 && handle2) {
            onCompare(handle1, handle2);
        }
    };

    return (
        <Card className="max-w-3xl mx-auto border-border/50 shadow-lg">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Compare Profiles</CardTitle>
                <CardDescription>
                    Enter two Codeforces handles to see head-to-head statistics and rating comparison.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="First Handle (e.g. tourist)"
                            className="pl-10"
                            value={handle1}
                            onChange={(e) => setHandle1(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted p-2 rounded-full hidden md:block">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Second Handle (e.g. Petr)"
                            className="pl-10"
                            value={handle2}
                            onChange={(e) => setHandle2(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={!handle1 || !handle2} className="w-full md:w-auto font-bold">
                        Compare
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
