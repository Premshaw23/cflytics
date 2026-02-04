import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-16 max-w-4xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-3xl font-black tracking-tight">Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground font-medium leading-relaxed">
            <p>
              CFlytics can be used without logging in. In guest mode, bookmarks/notes/goals are stored locally in your
              browser.
            </p>
            <p>
              If you connect your Codeforces handle, CFlytics stores synced data (bookmarks/notes/goals) in the database
              under your verified handle.
            </p>
            <p>
              Public Codeforces profile data is fetched from the Codeforces API. No passwords are collected.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline" className="font-bold">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

