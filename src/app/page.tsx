"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  BarChart2,
  Target,
  Trophy,
  TrendingUp,
  Zap,
  ChevronRight,
  Code,
  ArrowRight,
  Sparkles,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileNav } from "@/components/shared/MobileNav";
import { siteConfig } from "@/config/site";

const features = [
  {
    title: "Advanced Analytics",
    description: "Deep dive into your Codeforces performance with interactive charts and historical data analysis.",
    icon: BarChart2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Problem Recommendations",
    description: "Get personalized problem suggestions based on your rating, weak topics, and recent solve patterns.",
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Contest Tracking",
    description: "Keep track of upcoming and past contests with real-time countdowns and performance metrics.",
    icon: Trophy,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Performance Insights",
    description: "Analyze your submission history, verdict distribution, and rating milestones with precision.",
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "User Comparison",
    description: "Compare your progress with friends or rivals side-by-side with multi-line rating visualizations.",
    icon: LineChart,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Smart Goal Setting",
    description: "Set personalized goals for rating or problem counts and track your journey in real-time.",
    icon: Zap,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export default function LandingPage() {
  const [handle, setHandle] = useState("");
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      router.push(`/profile/${handle.trim()}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-background" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-primary/20">
              <Code className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Codey</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/problems" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Problems</Link>
            <Link href="/contests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contests</Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <ThemeToggle />
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:flex px-2" asChild>
              <Link href="/connect">Log in</Link>
            </Button>
            <Button className="h-9 px-4 md:px-6 font-bold transition-all text-sm" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <MobileNav items={[
              { title: "Problems", href: "/problems" },
              { title: "Contests", href: "/contests" },
              { title: "Dashboard", href: "/dashboard" },
              { title: "Compare", href: "/compare" },
              { title: "About", href: "/about" },
            ]} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        <motion.div
          style={{ opacity, scale }}
          className="container mx-auto px-6 md:px-12 lg:px-16 text-center z-10 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <Badge variant="outline" className="mb-6 md:mb-8 py-1.5 px-3 md:px-4 text-[9px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 mr-2" /> Elite Codeforces Analytics
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 md:mb-10 leading-[1.1] md:leading-[0.95] text-foreground">
              MASTER THE <br />
              <span className="bg-clip-text text-transparent bg-linear-to-b from-foreground via-foreground/90 to-foreground/40">
                ALGORITHM
              </span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl md:max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed font-bold uppercase tracking-tight px-2">
              The fastest way to analyze, track, and dominate your Codeforces journey.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-12 md:mb-20 px-0"
          >
            <form onSubmit={handleSearch} className="relative group max-w-[95%] sm:max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-primary/10 rounded-[24px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-card border border-border rounded-2xl md:rounded-3xl shadow-lg p-1.5 md:p-2.5 transition-all">
                <div className="flex items-center flex-1">
                  <Search className="ml-4 md:ml-6 text-muted-foreground w-5 h-5 shrink-0" />
                  <input
                    type="text"
                    placeholder="Analyze handle..."
                    className="flex-1 bg-transparent border-none outline-none py-5 px-4 text-base md:text-xl text-foreground placeholder:text-muted-foreground font-bold w-full"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
                <div className="flex items-center p-1 sm:p-0 sm:pr-2">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-12 font-black rounded-xl text-xs md:text-base transition-all active:scale-95"
                  >
                    ANALYZE
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-muted-foreground px-4">
              <span className="opacity-50">Popular:</span>
              <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                {["tourist", "Benq", "Egor", "Radewoosh"].map(h => (
                  <button key={h} onClick={() => setHandle(h)} className="hover:text-primary transition-colors hover:scale-110 active:scale-95">{h}</button>
                ))}
              </div>
            </div>
          </motion.div>


        </motion.div>
      </section>



      <section className="pb-12 md:pb-20 pt-6 md:pt-10 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 px-4">
            <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tight text-foreground leading-tight">REENGINEERING COMPETITIVE TRACKING</h2>
            <p className="text-muted-foreground font-bold text-sm md:text-lg leading-relaxed">
              Every feature is obsessed over to provide the fastest, most insightful experience for coders who care about growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-card border-border/50 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden flex flex-col shadow-sm hover:shadow-md">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.12] transition-opacity duration-500 group-hover:scale-150 transform rotate-12">
                    <feature.icon size={120} className="text-foreground" />
                  </div>
                  <CardContent className="p-10 flex-1 flex flex-col">
                    <div className={`${feature.bg} ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-8 shadow-inner`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors text-foreground uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-bold text-sm lg:text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                  <div className="px-10 pb-10 mt-auto">
                    <div className="h-0.5 w-0 group-hover:w-full bg-primary transition-all duration-500 rounded-full" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-muted/30 border-y border-border relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 md:w-150 h-75 md:h-150 bg-primary/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 lg:px-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-8 md:space-y-10 text-center lg:text-left">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 md:px-4 py-1.5 font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[9px] md:text-[10px]">Premium Insight</Badge>
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground leading-[1.1] md:leading-[0.95]">
                  DATA VISUALIZATION <br className="hidden md:block" />
                  <span className="text-muted-foreground">REDEFINED</span>
                </h2>
              </div>
              <p className="text-base md:text-xl text-muted-foreground font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
                Codey turns abstract numbers into actionable intelligence. Experience the most advanced tracking engine in the competitive programming ecosystem.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pb-4">
                {[
                  { title: "D3 Engine", desc: "Interactive rating progression charts" },
                  { title: "Deep Trace", desc: "Submission pattern analysis" },
                  { title: "Benchmark", desc: "Global rank benchmarking" },
                  { title: "Smart Tags", desc: "Weak-topic detection systems" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5 md:space-y-2 group">
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-primary" />
                      <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-bold lg:ml-5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 font-black tracking-widest transition-all shadow-xl text-xs md:text-base" asChild>
                <Link href="/dashboard">EXPLORE THE PLATFORM <ChevronRight className="ml-2 w-4 md:w-5 h-4 md:h-5" /></Link>
              </Button>
            </div>
            <div className="flex-1 w-full max-w-sm md:max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[LineChart, Trophy, Target, Zap].map((Icon, i) => (
                  <div key={i} className="aspect-square rounded-2xl md:rounded-3xl bg-card border border-border flex items-center justify-center group hover:border-primary/50 transition-all duration-500 shadow-lg hover:shadow-xl">
                    <Icon className="w-8 md:w-12 h-8 md:h-12 text-muted-foreground group-hover:text-primary transition-all duration-500 group-hover:scale-110" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-40">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden p-12 md:p-24 text-center border border-border bg-card shadow-xl"
          >
            <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-primary/5 to-purple-500/10 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />

            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
                READY TO <br />
                <span className="text-primary italic">ASCEND?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-bold leading-relaxed">
                Join the elite circle of coders who use Codey to dominate their contests and track their legacy.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Button size="lg" className="h-16 px-12 text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 rounded-2xl" asChild>
                  <Link href="/dashboard">CLAIM YOUR DASHBOARD</Link>
                </Button>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground font-black text-sm uppercase tracking-widest transition-colors flex items-center gap-2 group">
                  EXPLORE THE ARCHIVE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-24 border-t border-border relative bg-muted/30">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2 space-y-8">
              <Link href="/" className="flex items-center space-x-2 group w-fit">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20">
                  <Code className="text-primary-foreground w-5 h-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">Codey</span>
              </Link>
              <p className="text-muted-foreground text-lg max-w-md font-bold leading-relaxed">
                Empowering the next generation of algorithmic masterminds with elite data visualization and tracking.
              </p>
              <div className="flex gap-6">
                <Link
                  href={siteConfig.links.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  X
                </Link>
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
                <Link
                  href={siteConfig.links.codeforces}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Codeforces
                </Link>
                <Link
                  href={siteConfig.links.email}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Email
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-12 md:col-span-2">
              <div className="space-y-6">
                <h4 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Platform</h4>
                <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                  <li><Link href="/problems" className="hover:text-foreground transition-colors">Explorer</Link></li>
                  <li><Link href="/contests" className="hover:text-foreground transition-colors">Contests</Link></li>
                  <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Analytics</Link></li>
                  <li><Link href="/compare" className="hover:text-foreground transition-colors">Rivalry</Link></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Company</h4>
                <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                  <li><Link href="/about" className="hover:text-foreground transition-colors">Vision</Link></li>
                  <li><Link href="/blog" className="hover:text-foreground transition-colors">Changelog</Link></li>
                  <li><Link href="/privacy" className="hover:text-foreground transition-colors">Security</Link></li>
                  <li><Link href="/contact" className="hover:text-foreground transition-colors">Connect</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              © {new Date().getFullYear()} Codey Intelligence. All Rights Reserved.
            </div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEMS OPERATIONAL • CF API LINKED
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
