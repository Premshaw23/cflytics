'use client'

import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export const LANGUAGES = [
    { value: 'cpp', label: 'C++ (GCC 9.2)', icon: '🔧' },
    { value: 'python', label: 'Python 3.8', icon: '🐍' },
    { value: 'java', label: 'Java 13', icon: '☕' },
    { value: 'javascript', label: 'Node.js 12', icon: '📜' },
    { value: 'go', label: 'Go 1.13', icon: '🔷' },
    { value: 'rust', label: 'Rust 1.40', icon: '🦀' },
]

interface LanguageSelectorProps {
    value: string
    onChange: (value: string) => void
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
    const selectedLang = LANGUAGES.find(l => l.value === value)

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={cn("w-[110px] sm:w-[180px] bg-background text-xs sm:text-sm px-2 sm:px-3", !value && "text-muted-foreground")}>
                <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                        <span className="flex items-center gap-2">
                            <span className="text-lg">{lang.icon}</span>
                            <span>{lang.label}</span>
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
