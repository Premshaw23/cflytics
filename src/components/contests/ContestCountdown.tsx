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
            return null;
        }
    };

    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (!remaining) {
                if (onTimerEnd) onTimerEnd();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTimeSeconds, onTimerEnd]);

    if (!timeLeft) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">In Progress</span>
            </div>
        );
    }

    const { days, hours, minutes, seconds } = timeLeft;

    return (
        <div className={cn("flex items-center gap-2 md:gap-3", className)}>
            {[
                { label: "D", value: days, show: days > 0 },
                { label: "H", value: hours, show: true },
                { label: "M", value: minutes, show: true },
                { label: "S", value: seconds, show: true }
            ].filter(t => t.show).map((t, i, arr) => (
                <React.Fragment key={t.label}>
                    <div className="flex items-end gap-0.5">
                        <span className="text-lg md:text-xl font-black tracking-tighter text-white tabular-nums leading-none">
                            {t.value.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">{t.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                        <div className="text-zinc-800 font-black text-sm select-none mb-0.5">:</div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
