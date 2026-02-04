import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Guest + Connected accounts", desc: "Dual-mode usage: local first, optional sync.", date: "2026" },
  { title: "Profile viewing UX", desc: "Clear ‘Connected as’ vs ‘Viewing’ state.", date: "2026" },
];

export default function BlogPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 py-16 max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Changelog</h1>
          <p className="text-muted-foreground font-medium">
            Small updates and improvements as CFlytics evolves.
          </p>
        </div>

        <div className="grid gap-4">
          {items.map((it) => (
            <Card key={it.title} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">{it.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground font-medium">
                <div className="flex items-center justify-between gap-4">
                  <span>{it.desc}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{it.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Button asChild variant="outline" className="font-bold">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

