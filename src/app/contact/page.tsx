import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-16 max-w-4xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-3xl font-black tracking-tight">Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground font-medium leading-relaxed">
            <p>
              Want to report a bug or suggest a feature? The fastest way is via GitHub.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <Button asChild className="font-bold">
                <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                  GitHub Repo
                </a>
              </Button>
              <Button asChild className="font-bold">
                <a href={siteConfig.links.x} target="_blank" rel="noopener noreferrer">
                  X Profile
                </a>
              </Button>
              <Button asChild className="font-bold">
                <a href={siteConfig.links.codeforces} target="_blank" rel="noopener noreferrer">
                  Codeforces Profile
                </a>
              </Button>
              <Button asChild className="font-bold">
                <a href={siteConfig.links.email}>
                  Email
                </a>
              </Button>
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

