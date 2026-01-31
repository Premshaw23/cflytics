import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * Formats a date or timestamp to Indian Standard Time (IST)
 * IST is UTC+5:30
 */
export function formatIST(date: Date | number, formatStr: string = "dd/MM/yyyy HH:mm"): string {
    const d = typeof date === 'number' ? new Date(date) : date;
    
    // Explicitly set the time zone to Asia/Kolkata (IST)
    const istDate = toZonedTime(d, "Asia/Kolkata");
    
    return format(istDate, formatStr);
}

/**
 * Returns a relative time string but ensures the base date is treated correctly
 */
export function getRelativeTime(date: Date | number): string {
    const d = typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatIST(d, "dd/MM/yyyy");
}
