import { Metadata } from "next";
import ContestsClient from "./ContestsClient";

export const metadata: Metadata = {
    title: "Contests Schedule",
    description: "Stay updated with the latest Codeforces contests. View upcoming rounds, past contest archives, and add schedules to your calendar.",
};

export default function ContestsPage() {
    return <ContestsClient />;
}
