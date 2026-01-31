import { Metadata } from "next";
import ProblemsClient from "./ProblemsClient";

export const metadata: Metadata = {
    title: "Problems Explorer",
    description: "Browse, filter, and search through thousands of Codeforces problems. Find new challenges based on rating, tags, and more.",
};

export default function ProblemsPage() {
    return <ProblemsClient />;
}
