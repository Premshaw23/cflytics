'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'

interface CodeEditorProps {
    language: string
    value: string
    onChange?: (value: string | undefined) => void
    height?: string
    readOnly?: boolean
}

export function CodeEditor({
    language,
    value,
    onChange,
    height = '500px',
    readOnly = false,
}: CodeEditorProps) {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const completionProviderRef = useRef<any>(null);

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        return () => {
            if (completionProviderRef.current) {
                completionProviderRef.current.dispose();
            }
        };
    }, []);

    // Map our language values to Monaco language IDs
    const monacoLanguage = language === 'cpp' ? 'cpp' :
        language === 'javascript' ? 'javascript' :
            language === 'python' ? 'python' :
                language === 'java' ? 'java' :
                    language === 'go' ? 'go' :
                        language === 'rust' ? 'rust' : 'plaintext'

    if (!mounted) {
        return <div className="rounded-md border h-full bg-zinc-50 dark:bg-zinc-950 animate-pulse" />
    }

    const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light'

    const handleEditorDidMount = (editor: any, monaco: any) => {
        // Dispose old if exists
        if (completionProviderRef.current) {
            completionProviderRef.current.dispose();
        }

        // Register custom completions for C++ (The "Best" solution for browser IntelliSense)
        completionProviderRef.current = monaco.languages.registerCompletionItemProvider('cpp', {
            provideCompletionItems: (model: any, position: any) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const commonCpp = [
                    // Containers
                    { label: 'vector', kind: monaco.languages.CompletionItemKind.Class, insertText: 'vector<${1:int}> ${2:v};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::vector' },
                    { label: 'unordered_map', kind: monaco.languages.CompletionItemKind.Class, insertText: 'unordered_map<${1:int}, ${2:int}> ${3:um};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::unordered_map' },
                    { label: 'unordered_set', kind: monaco.languages.CompletionItemKind.Class, insertText: 'unordered_set<${1:int}> ${2:us};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::unordered_set' },
                    { label: 'map', kind: monaco.languages.CompletionItemKind.Class, insertText: 'map<${1:int}, ${2:int}> ${3:m};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::map' },
                    { label: 'set', kind: monaco.languages.CompletionItemKind.Class, insertText: 'set<${1:int}> ${2:s};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::set' },
                    { label: 'pair', kind: monaco.languages.CompletionItemKind.Class, insertText: 'pair<${1:int}, ${2:int}> ${3:p};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::pair' },
                    { label: 'priority_queue', kind: monaco.languages.CompletionItemKind.Class, insertText: 'priority_queue<${1:int}> ${2:pq};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::priority_queue' },
                    { label: 'deque', kind: monaco.languages.CompletionItemKind.Class, insertText: 'deque<${1:int}> ${2:dq};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::deque' },
                    { label: 'string', kind: monaco.languages.CompletionItemKind.Class, insertText: 'string ${1:s};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::string' },

                    // Functions/Methods
                    { label: 'push_back', kind: monaco.languages.CompletionItemKind.Method, insertText: 'push_back(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'vector/string.push_back()' },
                    { label: 'emplace_back', kind: monaco.languages.CompletionItemKind.Method, insertText: 'emplace_back(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'substr', kind: monaco.languages.CompletionItemKind.Method, insertText: 'substr(${1:pos}, ${2:len})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'string.substr()' },
                    { label: 'length', kind: monaco.languages.CompletionItemKind.Method, insertText: 'length()', detail: 'string.length()' },
                    { label: 'getline', kind: monaco.languages.CompletionItemKind.Function, insertText: 'getline(cin, ${1:s});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'std::getline()' },
                    { label: 'pb', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'push_back(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'mp', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'make_pair(${1}, ${2});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'all', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '${1:v}.begin(), ${1:v}.end()', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'sort', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sort(${1:v}.begin(), ${1:v}.end());', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'reverse', kind: monaco.languages.CompletionItemKind.Function, insertText: 'reverse(${1:v}.begin(), ${1:v}.end());', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'lower_bound', kind: monaco.languages.CompletionItemKind.Function, insertText: 'lower_bound(${1:v}.begin(), ${1:v}.end(), ${2:x});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'upper_bound', kind: monaco.languages.CompletionItemKind.Function, insertText: 'upper_bound(${1:v}.begin(), ${1:v}.end(), ${2:x});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'max_element', kind: monaco.languages.CompletionItemKind.Function, insertText: '*max_element(${1:v}.begin(), ${1:v}.end());', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'min_element', kind: monaco.languages.CompletionItemKind.Function, insertText: '*min_element(${1:v}.begin(), ${1:v}.end());', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'popcount', kind: monaco.languages.CompletionItemKind.Function, insertText: '__builtin_popcount(${1:x});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },

                    // I/O & Types
                    { label: 'fastio', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'ios_base::sync_with_stdio(false); cin.tie(NULL);', detail: 'Speed up C++ I/O' },
                    { label: 'cout', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'cout << ${1} << endl;', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'cin', kind: monaco.languages.CompletionItemKind.Variable, insertText: 'cin >> ${1};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'll', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'long long ' },
                    { label: 'MOD', kind: monaco.languages.CompletionItemKind.Constant, insertText: 'const int MOD = 1e9 + 7;' },
                    { label: 'INF', kind: monaco.languages.CompletionItemKind.Constant, insertText: 'const long long INF = 1e18;' },
                    { label: 'bits', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '#include <bits/stdc++.h>\nusing namespace std;' },

                    // Loops & Shortcuts
                    { label: 'fori', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int i = 0; i < ${1:n}; ++i) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'forj', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int j = 0; j < ${1:m}; ++j) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: 'tc', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'int t;\ncin >> t;\nwhile (t--) {\n\t${1}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Test case loop' },
                    { label: 'vi', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'vector<int> ' },
                    { label: 'pii', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'pair<int, int> ' },
                    { label: 'F', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'first' },
                    { label: 'S', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'second' },
                    { label: 'YES', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'cout << "YES" << endl;' },
                    { label: 'NO', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'cout << "NO" << endl;' },
                ];

                const suggestions = commonCpp.map(item => ({
                    ...item,
                    range: range
                }));

                return { suggestions };
            }
        });

        // Add C++ keywords manually to ensure they always show up
        monaco.languages.setLanguageConfiguration('cpp', {
            wordPattern: /(-?\d*\.\d\w*)|([^\`\\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        });
    };

    return (
        <div className="rounded-md border overflow-hidden h-full">
            <Editor
                height={height}
                language={monacoLanguage}
                value={value}
                onChange={onChange}
                onMount={handleEditorDidMount}
                theme={editorTheme}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                    padding: { top: 10, bottom: 10 },
                    cursorStyle: 'line',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    // Auto-suggestion settings
                    quickSuggestions: {
                        other: true,
                        comments: true,
                        strings: true
                    },
                    suggestOnTriggerCharacters: true,
                    parameterHints: {
                        enabled: true
                    },
                    formatOnType: true,
                    formatOnPaste: true,
                    suggestSelection: 'first',
                    wordBasedSuggestions: "allDocuments",
                    suggest: {
                        showWords: true,
                        showInterfaces: true,
                        showFunctions: true,
                        showMethods: true,
                    },
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',
                    bracketPairColorization: {
                        enabled: true
                    },
                    guides: {
                        bracketPairs: true,
                        indentation: true
                    }
                }}
            />
        </div>
    )
}
