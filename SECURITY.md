# Security Policy

## Supported Versions

Currently only the `main` branch is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within CFlytics, please do NOT open a public issue. Instead, please follow these steps:

1. Send an email to **shawprem217@gmail.com**.
2. Include a detailed description of the vulnerability.
3. Provide steps to reproduce the issue.
4. Include any potential impact or exploit scenarios.

We will acknowledge your report within 48 hours and provide a timeline for a fix if necessary.

## Responsible Disclosure

We ask that you wait for us to address the issue before disclosing it publicly. We are committed to fixing security issues promptly and will give you credit if you wish.

## Coding Best Practices

- All inputs handled by the compiler are executed in isolated environments in production (if applicable).
- We use Zod for strict schema validation on all API routes.
- Sensitive environment variables should NEVER be committed to the repository.
