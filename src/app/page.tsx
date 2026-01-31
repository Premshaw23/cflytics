"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  BarChart2,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  ChevronRight,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Advanced Analytics",
    description: "Deep dive into your Codeforces performance with interactive charts and historical data.",
    icon: BarChart2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Problem Recommendations",
    description: "Get personalized problem suggestions based on your rating, weak topics, and solve patterns.",
    icon: Target,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Contest Tracking",
    description: "Keep track of upcoming and past contests with countdowns, performance metrics, and rating changes.",
    icon: Trophy,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Performance Insights",
    description: "Analyze your submission history, verdict distribution, solve time accuracy, and more.",
    icon: TrendingUp,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "User Comparison",
    description: "Compare your progress with friends or rivals side-by-side with multi-line rating charts.",
    icon: Zap,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Goal Setting",
    description: "Set personalized goals for rating or problem counts and track your progress in real-time.",
    icon: Code,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function LandingPage() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      router.push(`/profile/${handle.trim()}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob will-change-transform" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 will-change-transform" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 will-change-transform" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Codey</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/problems" className="text-sm font-medium hover:text-primary transition-colors">Problems</Link>
            <Link href="/contests" className="text-sm font-medium hover:text-primary transition-colors">Contests</Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 py-1 px-4 text-sm font-medium">
              Ultimate Codeforces Dashboard
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              Master Your Competitive <br /> Programming Journey
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Codey provides advanced analytics, personalized recommendations, and deep insights to help you climb the Codeforces ranks faster.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-foreground rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-card rounded-xl border border-border shadow-lg overflow-hidden p-1.5 focus-within:ring-2 ring-primary/20 transition-all">
                <Search className="ml-3 text-muted-foreground w-5 h-5 shrink-0" />
                <Input
                  type="text"
                  placeholder="Enter Codeforces handle..."
                  className="flex-1 border-none focus-visible:ring-0 text-lg py-6"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
                <Button type="submit" size="lg" className="px-8 font-semibold rounded-lg shadow-md hover:shadow-primary/25 transition-all">
                  Analyze
                </Button>
              </div>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              Try: <button onClick={() => setHandle("tourist")} className="underline hover:text-primary transition-colors">tourist</button>, <button onClick={() => setHandle("Benq")} className="underline hover:text-primary transition-colors">Benq</button>, <button onClick={() => setHandle("Egor")} className="underline hover:text-primary transition-colors">Egor</button>
            </p>
          </motion.div>

          {/* Hero Statistics Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: "Active Users", value: "2,000+" },
              { label: "Problems Analyzed", value: "8,000+" },
              { label: "Contest Insights", value: "500+" },
              { label: "Rating Progressed", value: "1M+" },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border/50 text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Codey?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-medium">
              We provide the most comprehensive suite of tools designed specifically for the serious competitive programmer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group h-full"
              >
                <Card className="h-full border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 flex flex-col">
                  <CardContent className="p-8 flex flex-col items-center text-center flex-1">
                    <div className={`${feature.bg} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base font-medium">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className="px-8 pb-8 pt-0 mt-auto flex justify-center">
                    <Button variant="ghost" size="sm" className="group/btn font-semibold">
                      Learn more <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative max-w-5xl mx-auto bg-primary rounded-3xl overflow-hidden p-8 md:p-16 text-center text-primary-foreground">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
              Ready to level up your CP game?
            </h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10 font-medium">
              Join thousands of coders who use Codey to track their progress and achieve their competitive programming goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Button size="lg" variant="secondary" className="px-10 h-14 text-base font-bold transition-transform hover:scale-105" asChild>
                <Link href="/dashboard">Get Started Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="px-10 h-14 text-base font-bold bg-transparent border-white/20 hover:bg-white/10 transition-transform hover:scale-105">
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Code className="text-primary-foreground w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">Codey</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed font-medium">
                The most powerful performance tracking and analytics platform for Codeforce competitors.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-xs opacity-50">Product</h4>
                <ul className="space-y-2 text-sm font-medium">
                  <li><Link href="/problems" className="hover:text-primary transition-colors">Problems</Link></li>
                  <li><Link href="/contests" className="hover:text-primary transition-colors">Contests</Link></li>
                  <li><Link href="/compare" className="hover:text-primary transition-colors">Compare</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-widest text-xs opacity-50">Links</h4>
                <ul className="space-y-2 text-sm font-medium">
                  <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                  <li><Link href="/github" className="hover:text-primary transition-colors">GitHub</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs font-medium text-muted-foreground">
            <p>© {new Date().getFullYear()} Codey. Built with Next.js & Tailwind CSS.</p>
            <p>Data provided by Codeforces API.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
