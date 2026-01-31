import { describe, it, expect } from "vitest";
import { formatContestName } from "./contest-utils";

describe("formatContestName", () => {
    it("should return the name as is if it already contains a round number", () => {
        const name = "Codeforces Round #123 (Div. 2)";
        expect(formatContestName(name, "123")).toBe(name);
    });

    it("should inject the contest ID if it's a generic Codeforces Round", () => {
        const name = "Codeforces Round (Div. 2)";
        const id = 2192;
        expect(formatContestName(name, id)).toBe("Codeforces Round #2192 (Div. 2)");
    });

    it("should handle Codeforces Round without Div specified", () => {
        const name = "Codeforces Round";
        const id = 1000;
        expect(formatContestName(name, id)).toBe("Codeforces Round #1000");
    });

    it("should format Educational Codeforces Rounds", () => {
        const name = "Educational Codeforces Round";
        const id = 99;
        expect(formatContestName(name, id)).toBe("Educational Round #99");
    });

    it("should not modify other types of contests significantly", () => {
        const name = "Kotlin Heroes: Episode 9";
        expect(formatContestName(name, 500)).toBe(name);
    });
});
