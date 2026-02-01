'use client';

import { Timer } from 'lucide-react';
import { toast } from 'sonner';

interface TestCase {
    input: string;
    output: string;
}

interface SampleTestCasesProps {
    samples: TestCase[];
}

export function SampleTestCases({ samples }: SampleTestCasesProps) {
    const copyToClipboard = async (text: string, type: 'input' | 'output') => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${type === 'input' ? 'Input' : 'Output'} copied to clipboard!`);
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    if (samples.length === 0) {
        return (
            <div className="bg-muted/30 p-6 rounded-xl border border-dashed border-border text-center text-muted-foreground text-sm">
                Samples only available on Codeforces for this problem.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {samples.map((sample, idx) => (
                <div key={idx} className="border border-border/50 rounded-2xl overflow-hidden bg-card/30 shadow-lg">
                    {/* Test Case Header */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-3 border-b border-border/50">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-500">
                                {idx + 1}
                            </div>
                            Test Case {idx + 1}
                        </h3>
                    </div>

                    {/* Input/Output Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        {/* Input */}
                        <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Timer className="h-3 w-3" /> Input
                                </p>
                                <button
                                    onClick={() => copyToClipboard(sample.input, 'input')}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                                    title="Copy input"
                                >
                                    Copy
                                </button>
                            </div>
                            <pre suppressHydrationWarning className="bg-muted/50 p-4 rounded-xl text-sm font-mono border border-border/50 overflow-x-auto shadow-inner whitespace-pre break-words">
                                {sample.input}
                            </pre>
                        </div>

                        {/* Output */}
                        <div className="p-6 space-y-3 bg-gradient-to-br from-indigo-500/[0.02] to-purple-500/[0.02]">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                    <Timer className="h-3 w-3" /> Expected Output
                                </p>
                                <button
                                    onClick={() => copyToClipboard(sample.output, 'output')}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted/50"
                                    title="Copy output"
                                >
                                    Copy
                                </button>
                            </div>
                            <pre suppressHydrationWarning className="bg-indigo-500/5 p-4 rounded-xl text-sm font-mono border border-indigo-500/20 overflow-x-auto shadow-inner text-indigo-400 whitespace-pre">
                                {sample.output}
                            </pre>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
