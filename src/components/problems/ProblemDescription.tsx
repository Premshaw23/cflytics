'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Processes Codeforces problem HTML to render LaTeX and clean up formatting
 */
export function ProblemDescription({ html }: { html: string }) {
    const processedHtml = useMemo(() => {
        if (!html) return '';

        // Helper for KaTeX decoding and character conversion
        const decodeForKatex = (str: string) => {
            return str
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'")
                .replace(/&#39;/g, "'")
                .replace(/&apos;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/≥/g, '\\ge')
                .replace(/≤/g, '\\le')
                .replace(/\u2217/g, '*')
                .replace(/<[^>]+>/g, '') // Strip internal tags
                .trim();
        };

        const renderMath = (latex: string, isSingle: boolean) => {
            const decoded = decodeForKatex(latex);
            if (!decoded) return '';

            // Fix formatting for KaTeX stability
            const fixedLatex = decoded
                .replace(/\\le(?![a-zA-Z\s])/g, '\\le ') // Ensure space after \le
                .replace(/\\ge(?![a-zA-Z\s])/g, '\\ge ')
                .replace(/(\w)_(\w)/g, '$1_{$2}')       // Braces for subscripts
                .replace(/(\w)\^(\w)/g, '$1^{$2}');      // Braces for superscripts

            try {
                return katex.renderToString(fixedLatex, {
                    throwOnError: true,
                    displayMode: false,
                    output: 'html',
                    trust: true,
                    strict: 'ignore'
                });
            } catch (e) {
                const style = isSingle
                    ? "border-b border-dotted border-red-500/50"
                    : "bg-red-500/10 text-red-500/80 px-1 rounded font-mono text-xs";
                return `<span class="${style}" title="KaTeX Error: ${fixedLatex}">${decoded}</span>`;
            }
        };

        // 1. Initial Normalization
        let normalized = html
            // Convert HTML subscripts/superscripts to LaTeX
            .replace(/<sub>\s*([\d\w]+)\s*<\/sub>/g, '_{$1}')
            .replace(/<sup>\s*([\d\w]+)\s*<\/sup>/g, '^{$1}')
            // Convert common "m 1" patterns to subscripts
            .replace(/(\b[mnxykabij]\b)\s+(\d+)\b/g, '$1_$2');

        // 2. Split and Render by $$$
        const blocks = normalized.split('$$$');
        let finalOutput = '';

        for (let i = 0; i < blocks.length; i++) {
            if (i % 2 === 1) {
                // Inside $$$ ... $$$
                const content = blocks[i];
                if (/<(p|li|ul|ol|div)/i.test(content)) {
                    finalOutput += content.split(/(<[^>]+>)/).map(part => {
                        if (part.startsWith('<')) return part;
                        return renderMath(part, false);
                    }).join('');
                } else {
                    finalOutput += renderMath(content, false);
                }
            } else {
                // Regular text block - handle single $...$ AND "Naked" LaTeX
                let text = blocks[i];

                // Handle single $
                text = text.replace(/(^|[^\\$])\$((?!\s)[^$<>]+?)\$/g, (match, prefix, latex) => {
                    const isMath = /[\\_^=≥≤]|(\d+[a-zA-Z])|([a-zA-Z]\d+)/.test(latex) || (latex.length > 2 && latex.length < 50);
                    if (isMath) return prefix + renderMath(latex, true);
                    return match;
                });

                // Detect and wrap "Naked" LaTeX (no markers but contains commands/patterns)
                // This targets formulas like: m_1 + m_2 = m\text{ and } ...
                text = text.replace(/([a-zA-Z0-9_{}^=+\-\s\\]*(?:\\le|\\ge|\\text|\\dots|\\frac|\\sqrt)[a-zA-Z0-9_{}^=+\-\s\\]*)/g, (match) => {
                    if ((match.includes('\\') || match.includes('_')) && match.trim().length > 5) {
                        return renderMath(match, true);
                    }
                    return match;
                });

                finalOutput += text;
            }
        }

        // 3. Post-processing cleanup
        return finalOutput
            .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '')
            .replace(/<\/p>\s*<p>/g, '</p><p>')
            .trim();
    }, [html]);

    return (
        <div
            suppressHydrationWarning
            className="prose prose-lg prose-indigo dark:prose-invert max-w-none 
                     bg-gradient-to-br from-card/50 to-card/30 
                     p-8 rounded-2xl border border-border/50 shadow-xl
                     prose-headings:text-foreground prose-headings:font-bold
                     prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                     prose-strong:text-foreground prose-strong:font-semibold
                     prose-code:text-indigo-400 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
                     prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50
                     prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                     prose-li:marker:text-indigo-500 prose-li:mb-2
                     [&_.katex]:inline-block [&_.katex]:mx-0.5
                     [&_.math-error]:text-red-400 [&_.math-error]:bg-red-500/10 [&_.math-error]:px-1.5 [&_.math-error]:py-0.5 [&_.math-error]:rounded [&_.math-error]:font-mono [&_.math-error]:text-sm"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
    );
}
