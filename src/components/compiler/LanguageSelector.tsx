'use client'

import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px] bg-background">
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
