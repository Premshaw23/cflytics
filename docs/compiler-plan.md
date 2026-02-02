# Codey - Advanced Compiler & IDE Feature Implementation Plan

## 📋 Overview

This plan adds a **LeetCode-style compiler and IDE** to Codey, allowing users to:
- Write and test code directly in the platform
- Run against sample and custom test cases
- View detailed execution results (actual vs expected)
- Seamlessly navigate from problem list → problem detail → compiler

---

## 🎯 Feature Requirements

### Core Features
1. **Multi-language support**: C++, Python, Java, JavaScript, Go, Rust
2. **Code editor**: Monaco Editor (VS Code's editor)
3. **Test case execution**: Run sample + custom test cases in parallel
4. **Results display**: Show actual vs expected for each test case
5. **Execution details**: Runtime, memory usage, verdict (AC/WA/TLE/MLE/RE)
6. **Code templates**: Pre-filled starter code for each language
7. **Full-screen mode**: Distraction-free coding
8. **Code persistence**: Save code in browser (localStorage) or database

### Advanced Features
1. **Parallel test execution**: Run all test cases simultaneously
2. **Custom test cases**: Add/edit/delete test cases
3. **Code sharing**: Generate shareable links
4. **Submission history**: Track all code submissions
5. **Syntax highlighting & IntelliSense**: Auto-completion, error detection
6. **Themes**: Light/dark editor themes
7. **Keyboard shortcuts**: Run (Ctrl+Enter), Submit (Ctrl+S), etc.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Problems Page                            │
│  - Table with clickable rows                                 │
│  - Click row → Navigate to /problems/[id]                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Problem Detail Page (/problems/[id])            │
│  - Problem description                                       │
│  - Sample test cases                                         │
│  - Constraints, tags                                         │
│  - Two action buttons:                                       │
│    1. "Solve on Codeforces" → External link                  │
│    2. "Code Here" → Navigate to /compiler?problemId=[id]     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           Compiler/IDE Page (/compiler)                      │
│                                                              │
│  ┌─────────────────────────┬─────────────────────────────┐  │
│  │  Problem Description    │   Monaco Code Editor        │  │
│  │  (Collapsible)          │   - Language selector       │  │
│  │  - Title                │   - Full-screen toggle      │  │
│  │  - Description          │   - Theme toggle            │  │
│  │  - Sample test cases    │   - Reset code button       │  │
│  └─────────────────────────┴─────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Test Cases & Results Panel                     │  │
│  │  - Tab 1: Sample Test Cases (from problem)             │  │
│  │  - Tab 2: Custom Test Cases (user-added)               │  │
│  │  - Add/Edit/Delete test cases                          │  │
│  │                                                         │  │
│  │  [Run Code] [Submit]                                    │  │
│  │                                                         │  │
│  │  Results Table:                                         │  │
│  │  ┌──────┬────────┬────────┬────────┬────────┬────────┐ │  │
│  │  │ Test │ Verdict│ Input  │Expected│ Actual │ Runtime│ │  │
│  │  ├──────┼────────┼────────┼────────┼────────┼────────┤ │  │
│  │  │  1   │   AC   │  ...   │  ...   │  ...   │ 0.12s  │ │  │
│  │  │  2   │   WA   │  ...   │  ...   │  ...   │ 0.08s  │ │  │
│  │  │  3   │   TLE  │  ...   │  N/A   │  N/A   │ >2.0s  │ │  │
│  │  └──────┴────────┴────────┴────────┴────────┴────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Implementation Plan (4 Weeks)

### **WEEK 1: Backend Infrastructure & Compiler API**

#### **Day 1 (Monday) - Code Execution Service Setup**

**Goal**: Set up a code execution service/API

**Options**:
1. **Self-hosted** (using Docker containers)
2. **Third-party API** (Piston, Judge0, Sphere Engine)

**Recommended**: **Judge0** (open-source, self-hostable, supports many languages)

**Tasks**:
- [ ] Install Judge0 using Docker Compose:
  ```bash
  git clone https://github.com/judge0/judge0.git
  cd judge0
  docker-compose up -d db redis
  docker-compose up -d
  ```
- [ ] Test Judge0 API:
  ```bash
  curl -X POST "http://localhost:2358/submissions" \
    -H "Content-Type: application/json" \
    -d '{"source_code": "print(\"Hello World\")", "language_id": 71}'
  ```
- [ ] Document Judge0 API endpoints
- [ ] Create environment variables:
  ```env
  JUDGE0_API_URL=http://localhost:2358
  JUDGE0_API_KEY=your_api_key_if_using_rapidapi
  ```

**Alternative**: Use **Piston API** (simpler, cloud-hosted)
- Endpoint: `https://emkc.org/api/v2/piston/execute`
- Free tier: 1000 requests/day

---

#### **Day 2 (Tuesday) - Create Compiler API Routes**

**File**: `src/app/api/compiler/execute/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358'

// Language ID mapping for Judge0
const LANGUAGE_IDS: Record<string, number> = {
  'cpp': 54,      // C++ (GCC 9.2.0)
  'python': 71,   // Python (3.8.1)
  'java': 62,     // Java (OpenJDK 13.0.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
  'go': 60,       // Go (1.13.5)
  'rust': 73,     // Rust (1.40.0)
}

interface ExecutionRequest {
  code: string
  language: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  timeLimit?: number // seconds
  memoryLimit?: number // MB
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json()
    const { code, language, testCases, timeLimit = 2, memoryLimit = 256 } = body

    const languageId = LANGUAGE_IDS[language]
    if (!languageId) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      )
    }

    // Execute all test cases in parallel
    const results = await Promise.all(
      testCases.map(async (testCase, index) => {
        try {
          // Submit code execution
          const submitResponse = await fetch(`${JUDGE0_URL}/submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source_code: code,
              language_id: languageId,
              stdin: testCase.input,
              expected_output: testCase.expectedOutput,
              cpu_time_limit: timeLimit,
              memory_limit: memoryLimit * 1024, // Convert MB to KB
            }),
          })

          const { token } = await submitResponse.json()

          // Poll for result
          let result
          let attempts = 0
          const maxAttempts = 20

          while (attempts < maxAttempts) {
            const resultResponse = await fetch(
              `${JUDGE0_URL}/submissions/${token}?fields=*`
            )
            result = await resultResponse.json()

            if (result.status.id > 2) break // Status > 2 means finished
            
            await new Promise(resolve => setTimeout(resolve, 500))
            attempts++
          }

          return {
            testCase: index + 1,
            verdict: getVerdict(result.status.id),
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: result.stdout || result.stderr || 'No output',
            runtime: result.time || 0,
            memory: result.memory || 0,
            statusId: result.status.id,
            compilationError: result.compile_output || null,
          }
        } catch (error) {
          return {
            testCase: index + 1,
            verdict: 'ERROR',
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: 'Execution failed',
            runtime: 0,
            memory: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    // Calculate overall result
    const allPassed = results.every(r => r.verdict === 'AC')
    const summary = {
      totalTests: testCases.length,
      passed: results.filter(r => r.verdict === 'AC').length,
      failed: results.filter(r => r.verdict !== 'AC').length,
      allPassed,
    }

    return NextResponse.json({
      success: true,
      summary,
      results,
    })
  } catch (error) {
    console.error('Compiler API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getVerdict(statusId: number): string {
  const verdicts: Record<number, string> = {
    3: 'AC',    // Accepted
    4: 'WA',    // Wrong Answer
    5: 'TLE',   // Time Limit Exceeded
    6: 'CE',    // Compilation Error
    7: 'RE',    // Runtime Error (SIGSEGV)
    8: 'RE',    // Runtime Error (SIGXFSZ)
    9: 'RE',    // Runtime Error (SIGFPE)
    10: 'RE',   // Runtime Error (SIGABRT)
    11: 'RE',   // Runtime Error (NZEC)
    12: 'RE',   // Runtime Error (Other)
    13: 'IE',   // Internal Error
    14: 'IE',   // Exec Format Error
  }
  return verdicts[statusId] || 'UNKNOWN'
}
```

**Tasks**:
- [ ] Create the API route above
- [ ] Test with sample code and test cases
- [ ] Add error handling for network failures
- [ ] Implement rate limiting (prevent abuse)

---

#### **Day 3 (Wednesday) - Database Schema for Submissions**

**Update**: `prisma/schema.prisma`

```prisma
model Submission {
  id            String   @id @default(cuid())
  userId        String?  // Optional: for logged-in users
  problemId     String   // Codeforces problem ID (e.g., "1234-A")
  language      String
  code          String   @db.Text
  verdict       String   // AC, WA, TLE, etc.
  runtime       Float?
  memory        Int?
  testsPassed   Int
  testsTotal    Int
  createdAt     DateTime @default(now())
  
  @@index([userId])
  @@index([problemId])
  @@index([createdAt])
}

model CodeTemplate {
  id          String @id @default(cuid())
  language    String
  problemId   String
  template    String @db.Text
  
  @@unique([language, problemId])
}
```

**Tasks**:
- [ ] Add models to Prisma schema
- [ ] Run migration:
  ```bash
  npx prisma migrate dev --name add_submissions
  npx prisma generate
  ```
- [ ] Create API route to save submissions: `/api/compiler/submit/route.ts`

---

#### **Day 4 (Thursday) - Code Templates System**

**File**: `src/lib/compiler/templates.ts`

```typescript
export const CODE_TEMPLATES: Record<string, Record<string, string>> = {
  cpp: {
    default: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
  },
  python: {
    default: `# Your code here

if __name__ == "__main__":
    pass`,
  },
  java: {
    default: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
        sc.close();
    }
}`,
  },
  javascript: {
    default: `// Your code here
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Your code here
});`,
  },
}

export function getTemplate(language: string, problemId?: string): string {
  // If we have a problem-specific template, use it
  // Otherwise, use default template
  return CODE_TEMPLATES[language]?.default || '// Start coding...'
}
```

**Tasks**:
- [ ] Create templates for all supported languages
- [ ] Add API endpoint to fetch templates: `/api/compiler/template/route.ts`
- [ ] (Optional) Allow custom templates per problem

---

#### **Day 5 (Friday) - Test Cases Management API**

**File**: `src/app/api/compiler/testcases/route.ts`

```typescript
// GET: Fetch sample test cases for a problem
// POST: Save custom test case
// DELETE: Remove custom test case

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const problemId = searchParams.get('problemId')
  
  if (!problemId) {
    return NextResponse.json({ error: 'Problem ID required' }, { status: 400 })
  }

  // Fetch sample test cases from Codeforces API or cache
  // For now, return mock data
  const testCases = [
    { input: '5\n1 2 3 4 5', expectedOutput: '15' },
    { input: '3\n10 20 30', expectedOutput: '60' },
  ]

  return NextResponse.json({ testCases })
}

export async function POST(request: NextRequest) {
  // Save custom test case to database
  const { problemId, input, expectedOutput } = await request.json()
  
  // Store in database (requires auth)
  // For now, return success
  return NextResponse.json({ success: true })
}
```

**Tasks**:
- [ ] Implement GET endpoint for sample test cases
- [ ] Implement POST endpoint for custom test cases
- [ ] Add validation for test case inputs

---

### **WEEK 2: Frontend - Monaco Editor & Compiler UI**

#### **Day 1 (Monday) - Install Monaco Editor**

**Tasks**:
- [ ] Install Monaco Editor:
  ```bash
  npm install @monaco-editor/react monaco-editor
  ```
- [ ] Create Monaco wrapper component: `src/components/compiler/CodeEditor.tsx`

```typescript
'use client'

import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string | undefined) => void
  height?: string
}

export function CodeEditor({
  language,
  value,
  onChange,
  height = '500px',
}: CodeEditorProps) {
  const { theme } = useTheme()

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
      }}
    />
  )
}
```

**Tasks**:
- [ ] Test Monaco Editor rendering
- [ ] Add language support for all languages
- [ ] Test theme switching

---

#### **Day 2 (Tuesday) - Compiler Page Layout**

**File**: `src/app/(dashboard)/compiler/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CodeEditor } from '@/components/compiler/CodeEditor'
import { TestCasePanel } from '@/components/compiler/TestCasePanel'
import { ProblemDescription } from '@/components/compiler/ProblemDescription'
import { LanguageSelector } from '@/components/compiler/LanguageSelector'
import { Button } from '@/components/ui/button'
import { Play, Send, Maximize2 } from 'lucide-react'

export default function CompilerPage() {
  const searchParams = useSearchParams()
  const problemId = searchParams.get('problemId')

  const [language, setLanguage] = useState('cpp')
  const [code, setCode] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showDescription, setShowDescription] = useState(true)

  // Load code template on language change
  useEffect(() => {
    async function loadTemplate() {
      const res = await fetch(`/api/compiler/template?language=${language}&problemId=${problemId}`)
      const { template } = await res.json()
      setCode(template)
    }
    loadTemplate()
  }, [language, problemId])

  const handleRunCode = async () => {
    setIsRunning(true)
    // Implement run logic
    setIsRunning(false)
  }

  const handleSubmit = async () => {
    // Implement submit logic
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Compiler</h1>
          {problemId && <span className="text-sm text-muted-foreground">Problem: {problemId}</span>}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector value={language} onChange={setLanguage} />
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Problem Description (collapsible) */}
        {showDescription && problemId && (
          <div className="w-1/3 overflow-y-auto border-r">
            <ProblemDescription problemId={problemId} />
          </div>
        )}

        {/* Right: Editor */}
        <div className="flex flex-1 flex-col">
          <CodeEditor
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            height="60%"
          />

          {/* Test Cases Panel */}
          <div className="h-2/5 border-t">
            <TestCasePanel
              problemId={problemId}
              results={results}
              onRun={handleRunCode}
              onSubmit={handleSubmit}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Tasks**:
- [ ] Create compiler page with layout
- [ ] Implement collapsible problem description
- [ ] Add full-screen mode toggle

---

#### **Day 3 (Wednesday) - Test Case Panel Component**

**File**: `src/components/compiler/TestCasePanel.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Play, Send, Plus } from 'lucide-react'

interface TestCase {
  input: string
  expectedOutput: string
}

interface TestResult {
  testCase: number
  verdict: string
  input: string
  expectedOutput: string
  actualOutput: string
  runtime: number
  memory: number
}

interface TestCasePanelProps {
  problemId: string | null
  results: TestResult[]
  onRun: () => void
  onSubmit: () => void
  isRunning: boolean
}

export function TestCasePanel({
  problemId,
  results,
  onRun,
  onSubmit,
  isRunning,
}: TestCasePanelProps) {
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([])
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([])

  useEffect(() => {
    if (problemId) {
      // Fetch sample test cases
      fetch(`/api/compiler/testcases?problemId=${problemId}`)
        .then(res => res.json())
        .then(data => setSampleTestCases(data.testCases))
    }
  }, [problemId])

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="sample" className="flex-1">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <TabsList>
            <TabsTrigger value="sample">
              Sample Tests ({sampleTestCases.length})
            </TabsTrigger>
            <TabsTrigger value="custom">
              Custom Tests ({customTestCases.length})
            </TabsTrigger>
            <TabsTrigger value="results">
              Results ({results.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              onClick={onRun}
              disabled={isRunning}
              size="sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Run Code
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isRunning}
              variant="default"
              size="sm"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>

        <TabsContent value="sample" className="flex-1 overflow-y-auto p-4">
          {sampleTestCases.map((tc, index) => (
            <div key={index} className="mb-4 rounded border p-3">
              <div className="mb-2 font-medium">Test Case {index + 1}</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="mb-1 text-sm text-muted-foreground">Input:</div>
                  <pre className="rounded bg-muted p-2 text-xs">{tc.input}</pre>
                </div>
                <div>
                  <div className="mb-1 text-sm text-muted-foreground">Expected:</div>
                  <pre className="rounded bg-muted p-2 text-xs">{tc.expectedOutput}</pre>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="flex-1 overflow-y-auto p-4">
          <Button variant="outline" size="sm" className="mb-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Test Case
          </Button>
          {/* Similar to sample, but editable */}
        </TabsContent>

        <TabsContent value="results" className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Run code to see results
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="rounded border p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Test Case {result.testCase}</span>
                    <Badge
                      variant={result.verdict === 'AC' ? 'success' : 'destructive'}
                    >
                      {result.verdict}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Input:</div>
                      <pre className="rounded bg-muted p-1">{result.input}</pre>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Expected:</div>
                      <pre className="rounded bg-muted p-1">{result.expectedOutput}</pre>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Actual:</div>
                      <pre className="rounded bg-muted p-1">{result.actualOutput}</pre>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>Runtime: {result.runtime.toFixed(2)}s</span>
                    <span>Memory: {result.memory} KB</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Tasks**:
- [ ] Create test case panel component
- [ ] Implement tabs for sample/custom/results
- [ ] Add ability to add custom test cases

---

#### **Day 4 (Thursday) - Language Selector & Other UI Components**

**File**: `src/components/compiler/LanguageSelector.tsx`

```typescript
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LANGUAGES = [
  { value: 'cpp', label: 'C++ (GCC 9.2)', icon: '🔧' },
  { value: 'python', label: 'Python 3.8', icon: '🐍' },
  { value: 'java', label: 'Java 13', icon: '☕' },
  { value: 'javascript', label: 'JavaScript (Node.js)', icon: '📜' },
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
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className="flex items-center gap-2">
              <span>{lang.icon}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**Tasks**:
- [ ] Create language selector
- [ ] Create problem description component
- [ ] Add loading states for all components

---

#### **Day 5 (Friday) - Connect Frontend to Backend**

**Tasks**:
- [ ] Implement `handleRunCode` function in compiler page
- [ ] Call `/api/compiler/execute` with code and test cases
- [ ] Display results in test case panel
- [ ] Add error handling for API failures
- [ ] Test end-to-end flow

**Example**:

```typescript
const handleRunCode = async () => {
  setIsRunning(true)
  setResults([])

  try {
    const response = await fetch('/api/compiler/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        testCases: [...sampleTestCases, ...customTestCases],
      }),
    })

    const data = await response.json()
    
    if (data.success) {
      setResults(data.results)
    } else {
      // Handle error
    }
  } catch (error) {
    console.error('Failed to run code:', error)
  } finally {
    setIsRunning(false)
  }
}
```

---

### **WEEK 3: Problem Integration & Navigation**

#### **Day 1 (Monday) - Update Problems Page**

**File**: `src/app/(dashboard)/problems/page.tsx`

**Changes**:
- [ ] Make table rows clickable
- [ ] Navigate to `/problems/[id]` on click
- [ ] Remove "Solve on Codeforces" button from table

```typescript
// In ProblemTable component
<TableRow
  key={problem.id}
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => router.push(`/problems/${problem.id}`)}
>
  {/* Table cells */}
</TableRow>
```

**Tasks**:
- [ ] Update problem table to be clickable
- [ ] Add hover effect
- [ ] Test navigation

---

#### **Day 2 (Tuesday) - Create Problem Detail Page**

**File**: `src/app/(dashboard)/problems/[id]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Code2 } from 'lucide-react'
import Link from 'next/link'

async function getProblem(id: string) {
  // Fetch problem from Codeforces API
  // For now, return mock data
  return {
    id,
    name: 'Problem Name',
    rating: 1500,
    tags: ['dp', 'greedy'],
    contestId: 1234,
    index: 'A',
    // ... more fields
  }
}

export default async function ProblemDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const problem = await getProblem(params.id)

  if (!problem) {
    notFound()
  }

  const codeforcesUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{problem.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{problem.rating}</Badge>
          {problem.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-4">
        <Button asChild size="lg">
          <Link href={`/compiler?problemId=${problem.id}`}>
            <Code2 className="mr-2 h-5 w-5" />
            Code Here
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={codeforcesUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-5 w-5" />
            View on Codeforces
          </a>
        </Button>
      </div>

      {/* Problem Description */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Problem Description</h2>
        {/* Fetch and render problem statement from Codeforces */}
        <div className="prose dark:prose-invert">
          {/* Problem statement goes here */}
        </div>
      </Card>

      {/* Sample Test Cases */}
      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Sample Test Cases</h2>
        {/* Display sample inputs/outputs */}
      </Card>

      {/* Constraints */}
      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Constraints</h2>
        {/* Display constraints */}
      </Card>
    </div>
  )
}
```

**Tasks**:
- [ ] Create problem detail page
- [ ] Fetch problem data from Codeforces
- [ ] Display problem statement, samples, constraints
- [ ] Add "Code Here" and "View on Codeforces" buttons

---

#### **Day 3 (Wednesday) - Fetch Problem Statement**

Codeforces API doesn't provide problem statements directly. You'll need to:

**Option 1**: Web scraping (not recommended, against ToS)

**Option 2**: Use Codeforces Problemset API + manual parsing

**Option 3**: Store problem statements in your database (pre-scraped ethically)

**Recommended**: Display a link to Codeforces and show only metadata (name, tags, rating, sample I/O)

**Tasks**:
- [ ] Decide on problem statement approach
- [ ] Implement chosen method
- [ ] Handle cases where statement isn't available

---

#### **Day 4 (Thursday) - Problem Description in Compiler**

**File**: `src/components/compiler/ProblemDescription.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ProblemDescriptionProps {
  problemId: string
}

export function ProblemDescription({ problemId }: ProblemDescriptionProps) {
  const [problem, setProblem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/problems/${problemId}`)
      .then(res => res.json())
      .then(data => {
        setProblem(data)
        setLoading(false)
      })
  }, [problemId])

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="mb-4 h-8 w-3/4" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (!problem) return null

  return (
    <div className="p-4">
      <h2 className="mb-2 text-xl font-bold">{problem.name}</h2>
      <div className="mb-4 flex gap-2">
        <Badge variant="outline">{problem.rating}</Badge>
        {problem.tags.map((tag: string) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>

      <div className="prose prose-sm dark:prose-invert">
        {/* Problem statement (if available) */}
        <h3>Sample Input/Output</h3>
        {/* Display samples */}
      </div>
    </div>
  )
}
```

**Tasks**:
- [ ] Create problem description component
- [ ] Show problem name, tags, rating
- [ ] Display sample test cases
- [ ] Add collapsible functionality

---

#### **Day 5 (Friday) - Polish Navigation Flow**

**Tasks**:
- [ ] Test full flow: Problems → Problem Detail → Compiler
- [ ] Add breadcrumbs for navigation
- [ ] Ensure back button works correctly
- [ ] Add "Go to Problem Detail" link from compiler
- [ ] Test on mobile devices

---

### **WEEK 4: Advanced Features & Polish**

#### **Day 1 (Monday) - Code Persistence**

**Tasks**:
- [ ] Save code to localStorage on change
- [ ] Restore code on page reload
- [ ] Add "Reset Code" button
- [ ] (Optional) Save to database for logged-in users

```typescript
// LocalStorage persistence
useEffect(() => {
  const savedCode = localStorage.getItem(`code-${problemId}-${language}`)
  if (savedCode) {
    setCode(savedCode)
  }
}, [problemId, language])

useEffect(() => {
  localStorage.setItem(`code-${problemId}-${language}`, code)
}, [code, problemId, language])
```

---

#### **Day 2 (Tuesday) - Submission History**

**Tasks**:
- [ ] Create submission history page: `/compiler/submissions`
- [ ] Show all past submissions
- [ ] Filter by problem, language, verdict
- [ ] Allow viewing past code
- [ ] Add "Run Again" functionality

---

#### **Day 3 (Wednesday) - Keyboard Shortcuts**

**Tasks**:
- [ ] Add keyboard shortcuts:
  - `Ctrl+Enter`: Run code
  - `Ctrl+S`: Save/submit
  - `Ctrl+/`: Toggle comment
  - `F11`: Full screen
- [ ] Display shortcuts help modal (`?` key)
- [ ] Make shortcuts customizable

---

#### **Day 4 (Thursday) - Performance Optimizations**

**Tasks**:
- [ ] Optimize Monaco Editor loading (code splitting)
- [ ] Add loading states for API calls
- [ ] Implement debouncing for code saves
- [ ] Cache test case results
- [ ] Add service worker for offline support (optional)

---

#### **Day 5 (Friday) - Testing & Bug Fixes**

**Tasks**:
- [ ] Test all features end-to-end
- [ ] Test with different problem types
- [ ] Test edge cases (empty code, invalid input, etc.)
- [ ] Fix any bugs found
- [ ] Test on different browsers
- [ ] Get user feedback

---

## 🎨 UI/UX Enhancements

### Additional Features to Consider

1. **Split View**: Option to view problem and editor side-by-side
2. **Code Snippets**: Save and reuse common code patterns
3. **Diff Viewer**: Show differences between expected and actual output
4. **Leaderboard**: Show fastest solutions for each problem
5. **Code Sharing**: Generate shareable links to code
6. **Syntax Themes**: Multiple editor themes (Monokai, Dracula, etc.)
7. **Font Customization**: Let users choose font and size
8. **Auto-save**: Auto-save code every 30 seconds
9. **Version History**: Track code changes over time
10. **Collaborative Coding**: Real-time collaboration (advanced)

---

## 📊 Metrics to Track

- Total code runs
- Average execution time per language
- Most used languages
- Problems with highest attempt count
- User success rate (AC on first attempt)
- Popular test case patterns

---

## 🔒 Security Considerations

1. **Code Execution Isolation**: Use Docker containers or sandboxed environments
2. **Rate Limiting**: Prevent abuse (max 10 runs per minute)
3. **Input Validation**: Sanitize all user inputs
4. **Resource Limits**: CPU time, memory, and output size limits
5. **Code Size Limit**: Max 64KB per submission
6. **Test Case Limit**: Max 20 test cases per run
7. **Authentication**: Require login for submissions (optional)

---

## 🚀 Deployment Checklist

- [ ] Set up Judge0 in production (Docker/VM)
- [ ] Configure environment variables
- [ ] Set up database for submissions
- [ ] Add monitoring for code execution failures
- [ ] Set up alerts for high resource usage
- [ ] Test load capacity (concurrent users)
- [ ] Add CDN for Monaco Editor assets
- [ ] Optimize bundle size
- [ ] Add error tracking (Sentry)

---

## 📚 Resources

### Judge0
- Docs: https://github.com/judge0/judge0
- API Reference: https://ce.judge0.com/

### Monaco Editor
- Docs: https://microsoft.github.io/monaco-editor/
- React: https://github.com/suren-atoyan/monaco-react

### Piston API (Alternative)
- Docs: https://github.com/engineer-man/piston

---

## 🎯 Success Criteria

✅ Users can write and run code in 6+ languages  
✅ Test cases execute in <5 seconds  
✅ Results display accurately (AC/WA/TLE/etc.)  
✅ Smooth navigation from Problems → Detail → Compiler  
✅ Code persists across sessions  
✅ Mobile-responsive design  
✅ 95%+ uptime for code execution  

---

## 🔄 Future Enhancements (Post-Launch)

- AI-powered hints and debugging
- Video tutorials for problems
- Community solutions showcase
- Contest mode with live leaderboard
- Gamification (XP, levels, badges)
- IDE extensions (VS Code integration)
- Mobile app (React Native)

---

**Ready to build? Start with Week 1, Day 1! 🚀**

Let me know if you need clarification on any section or want to dive deeper into specific components.