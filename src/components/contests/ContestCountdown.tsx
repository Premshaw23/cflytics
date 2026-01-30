"use client";

import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContestCountdownProps {
    targetTimeSeconds: number;
    className?: string;
    onTimerEnd?: () => void;
}

export function ContestCountdown({ targetTimeSeconds, className, onTimerEnd }: ContestCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetTimeSeconds * 1000 - now;

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            } else {
                if (onTimerEnd) onTimerEnd();
                return null;
            }
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (!remaining) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTimeSeconds, onTimerEnd]);

    if (!timeLeft) {
        return <span className="text-muted-foreground font-medium">Started</span>;
    }

    return (
        <div className={cn("flex items-center gap-2 font-mono text-primary font-bold", className)}>
            <Timer className="w-4 h-4" />
            <div className="flex items-center gap-1">
                {timeLeft.days > 0 && (
                    <>
                        <div className="bg-primary/10 rounded px-1.5 py-0.5 min-w-[3ch] text-center">
                            {timeLeft.days}d
                        </div>
                        <span>:</span>
                    </>
                )}
                <div className="bg-primary/10 rounded px-1.5 py-0.5 min-w-[3ch] text-center">
                    {timeLeft.hours.toString().padStart(2, '0')}h
                </div>
                <span>:</span>
                <div className="bg-primary/10 rounded px-1.5 py-0.5 min-w-[3ch] text-center">
                    {timeLeft.minutes.toString().padStart(2, '0')}m
                </div>
                <span>:</span>
                <div className="bg-primary/10 rounded px-1.5 py-0.5 min-w-[3ch] text-center">
                    {timeLeft.seconds.toString().padStart(2, '0')}s
                </div>
            </div>
        </div>
    );
}
