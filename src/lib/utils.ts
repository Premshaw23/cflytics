import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeProblemId(id: string): string {
  if (!id) return id;
  // Remove hyphens, spaces, and convert to uppercase (e.g., "1234-A" -> "1234A")
  return id.replace(/[-\s]/g, '').toUpperCase();
}
