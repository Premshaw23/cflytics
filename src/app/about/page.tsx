import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-16 max-w-4xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-3xl font-black tracking-tight">About CFlytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground font-medium leading-relaxed">
            <p>
              CFlytics is a Codeforces analytics dashboard that helps you understand progress, spot weaknesses,
              and stay consistent.
            </p>
            <p>
              You can use it in <b className="text-foreground">Guest mode</b> (no login) or connect your handle to sync
              bookmarks, notes, and goals.
            </p>
            <div className="flex gap-3 pt-2">
              <Button asChild className="font-bold">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="font-bold">
                <Link href="/connect">Connect Handle</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

