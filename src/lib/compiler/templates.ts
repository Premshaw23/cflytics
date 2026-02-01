export const CODE_TEMPLATES: Record<string, Record<string, string>> = {
  cpp: {
    default: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    return 0;
}`,
  },
  python: {
    default: `import sys

def solve():
    # Your code here
    pass

if __name__ == "__main__":
    solve()`,
  },
  java: {
    default: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
        sc.close();
    }
}`,
  },
  javascript: {
    default: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    // Your code here
    process.exit(0);
});`,
  },
  go: {
    default: `package main

import (
    "fmt"
)

func main() {
    // Your code here
}`,
  },
  rust: {
    default: `use std::io;

fn main() {
    // Your code here
}`,
  },
}

export function getTemplate(language: string, problemId?: string): string {
  // If we have a problem-specific template, use it
  // Otherwise, use default template
  return CODE_TEMPLATES[language]?.default || '// Start coding...'
}
