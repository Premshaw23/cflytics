import { NextRequest, NextResponse } from 'next/server'

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'http://127.0.0.1:2358'

// Language ID mapping for Judge0
const LANGUAGE_IDS: Record<string, number> = {
  'cpp': 105,      // C++ (GCC 14.1.0)
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

// Utility to decode base64 from Judge0
function decode(str: string | null): string {
  if (!str) return ''
  try {
    return Buffer.from(str, 'base64').toString('utf-8')
  } catch (e) {
    return str
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExecutionRequest = await request.json()
    const { code, language, testCases, timeLimit = 2, memoryLimit = 256 } = body

    const languageId = LANGUAGE_IDS[language]
    if (!languageId) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    // Process test cases
    const results = await Promise.all(
      testCases.map(async (testCase, index) => {
        try {
          // Submit code execution with retries
          let submitResponse;
          let retries = 2;
          
          while (retries >= 0) {
            try {
              submitResponse = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source_code: Buffer.from(code).toString('base64'),
                  language_id: languageId,
                  stdin: Buffer.from(testCase.input).toString('base64'),
                  expected_output: Buffer.from(testCase.expectedOutput).toString('base64'),
                  cpu_time_limit: timeLimit,
                  memory_limit: memoryLimit * 1024,
                  compiler_options: language === 'cpp' ? '-std=c++20' : undefined,
                }),
              });
              if (submitResponse.ok) break;
            } catch (e) {
              if (retries === 0) throw e;
            }
            retries--;
            await new Promise(r => setTimeout(r, 1000));
          }

          if (!submitResponse || !submitResponse.ok) {
            throw new Error(`Judge0 unreachable (${submitResponse?.status || 'Timeout'})`)
          }

          const { token } = await submitResponse.json()

          // Poll for result
          let result
          let attempts = 0
          const maxAttempts = 30 // Reduced for Vercel efficiency (15s total)
          
          while (attempts < maxAttempts) {
            const res = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=*`)
            result = await res.json()
            if (result.status && result.status.id > 2) break
            await new Promise(r => setTimeout(r, 500))
            attempts++
          }

          if (!result || !result.status || result.status.id <= 2) {
            return {
              testCase: index + 1,
              verdict: 'TLE',
              actualOutput: 'System timeout waiting for Judge0',
              error: 'The execution took too long or the server is busy.'
            }
          }

          // Decode all outputs
          const stdout = decode(result.stdout)
          const stderr = decode(result.stderr)
          const compile_output = decode(result.compile_output)
          const message = decode(result.message)

          return {
            testCase: index + 1,
            verdict: getVerdict(result.status.id),
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: stdout || stderr || compile_output || 'No output',
            runtime: parseFloat(result.time) || 0,
            memory: result.memory || 0,
            statusId: result.status.id,
            compilationError: result.status.id === 6 ? compile_output : null,
            message: message || (result.status.id > 3 ? result.status.description : null)
          }
        } catch (error) {
          console.error(`Case ${index + 1} Error:`, error)
          return {
            testCase: index + 1,
            verdict: 'IE',
            actualOutput: 'System Error',
            error: error instanceof Error ? error.message : 'Unknown'
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      summary: {
        totalTests: testCases.length,
        passed: results.filter(r => r.verdict === 'AC').length,
        failed: results.filter(r => r.verdict !== 'AC').length,
        allPassed: results.every(r => r.verdict === 'AC'),
      },
      results,
    })
  } catch (error) {
    console.error('Compiler API error:', error)
    return NextResponse.json({ error: 'Compiler Internal Error' }, { status: 500 })
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
