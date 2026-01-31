import { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
    title: "User Comparison",
    description: "Compare two Codeforces users side-by-side. View rating history, head-to-head contest records, and topic strength comparisons.",
};

export default function ComparePage() {
    return <CompareClient />;
}
