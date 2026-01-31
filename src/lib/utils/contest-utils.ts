/**
 * Formats a contest name to ensure it has a clear identifier (like a round number).
 * If Codeforces hasn't assigned a round number yet, it uses the contest ID.
 */
export function formatContestName(name: string, id: number | string): string {
    // If the name already has a # followed by digits, it has a round number
    if (/#\d+/.test(name)) {
        return name;
    }

    // Pattern for "Codeforces Round (Div. X)" -> "Codeforces Round #ID (Div. X)"
    if (name.includes("Codeforces Round") && name.includes("(")) {
        return name.replace("Codeforces Round", `Codeforces Round #${id}`);
    }

    // Pattern for "Codeforces Round" without Div -> "Codeforces Round #ID"
    if (name.startsWith("Codeforces Round") && !name.includes("#")) {
        return name.replace("Codeforces Round", `Codeforces Round #${id}`);
    }

    // Pattern for Educational Rounds
    if (name.includes("Educational Codeforces Round") && !name.includes("#")) {
        return name.replace("Educational Codeforces Round", `Educational Round #${id}`);
    }

    // Default: if it's very generic, just ensure the ID is visible somewhere if not already
    return name;
}
