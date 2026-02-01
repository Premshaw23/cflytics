'use client'

import { CodeEditor } from './CodeEditor'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface SharedCodeEditorProps {
    code: string
    language: string
}

export function SharedCodeEditor({ code, language }: SharedCodeEditorProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        toast.success("Code copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative h-full w-full group">
            <Button
                onClick={handleCopy}
                variant="secondary"
                size="sm"
                className="absolute top-4 right-8 z-20 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm border shadow-sm font-bold uppercase tracking-widest text-[10px]"
            >
                {copied ? <Check className="h-3 w-3 mr-2 text-emerald-500" /> : <Copy className="h-3 w-3 mr-2" />}
                {copied ? "Copied" : "Copy Code"}
            </Button>

            <CodeEditor
                language={language}
                value={code}
                onChange={() => { }} // Read-only
                height="100%"
            />
        </div>
    )
}
