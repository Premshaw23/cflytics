"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
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
  LineChart,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileNav } from "@/components/shared/MobileNav";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/lib/store/useAuth";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const { status: authStatus, user: authUser, logout } = useAuth();
  const isConnected = authStatus === "connected" && !!authUser;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      router.push(`/profile/${handle.trim()}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Premium Background Effects */}
      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-background/90 to-background" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Radial Orbs - Optimized for Light/Dark */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />

        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] opacity-40 dark:opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-primary/20">
              <Code className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">CFlytics</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/problems" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Problems</Link>
            <Link href="/contests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contests</Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <ThemeToggle />

            {authStatus === "loading" ? (
              <div className="w-24 h-9 bg-muted animate-pulse rounded-lg hidden sm:block" />
            ) : isConnected ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:flex px-4 font-bold text-xs uppercase tracking-widest" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3 gap-2 border-primary/20 hover:border-primary/50 bg-primary/5 transition-all rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-black truncate max-w-[80px]">{authUser.handle}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Authenticated</div>
                      <div className="text-sm font-bold truncate">@{authUser.handle}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href={`/profile/${authUser.handle}`} className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem
                      className="rounded-xl cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hidden sm:flex px-4 font-bold text-xs uppercase tracking-widest transition-all" asChild>
                  <Link href="/dashboard">Guest Mode</Link>
                </Button>
                <Button className="h-9 px-5 md:px-6 font-black transition-all text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95" asChild>
                  <Link href="/connect">Connect</Link>
                </Button>
              </>
            )}

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
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center">

        {/* Floating Stat Pills (Decorative) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden max-w-[1920px] mx-auto">
          {/* Left Pill */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute top-[25%] left-[5%] lg:left-[3%] hidden lg:flex items-center gap-4 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 p-4 rounded-3xl shadow-xl dark:shadow-2xl rotate-[-6deg]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground">Problems Solved</div>
              <div className="text-xl font-black text-zinc-900 dark:text-foreground">1,240+</div>
            </div>
          </motion.div>

          {/* Right Pill */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="absolute bottom-1/3 right-[5%] lg:right-[10%] hidden lg:flex items-center gap-4 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/10 p-4 rounded-3xl shadow-xl dark:shadow-2xl rotate-[6deg]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground">Rating Growth</div>
              <div className="text-xl font-black text-zinc-900 dark:text-foreground flex items-center gap-2">
                2100 <span className="text-emerald-600 dark:text-emerald-500 text-sm bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">+50</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity, scale }}
          className="container mx-auto px-6 md:px-12 lg:px-16 text-center z-10 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mb-8 md:mb-10 group cursor-default"
            >
              <Badge variant="outline" className="py-2 px-6 text-xs font-black uppercase tracking-[0.3em] border-primary/20 bg-primary/5 text-primary backdrop-blur-sm group-hover:border-primary/50 transition-all shadow-[0_0_20px_-10px_var(--primary)]">
                <Sparkles className="w-3.5 h-3.5 mr-3 animate-pulse" />
                The Analytics Engine for Winners
              </Badge>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 md:mb-12 leading-[0.9] text-foreground relative">
              <span className="inline-block relative">
                UNLOCK YOUR
                <motion.span
                  className="absolute -top-6 -right-6 md:-top-10 md:-right-10 text-primary opacity-20 blur-xl animate-pulse"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Zap className="w-12 h-12 md:w-24 md:h-24" />
                </motion.span>
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/90 to-foreground/50 pb-4">
                TRUE POTENTIAL
              </span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed font-bold tracking-tight px-4">
              Stop guessing. Start analyzing.
              <span className="block mt-2 text-foreground/80">
                The most advanced performance tracking suite built directly for the Codeforces ecosystem.
              </span>
            </p>
          </motion.div>

          {/* Search Box - Premium Glass Version */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mb-16 px-0 relative z-20"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-700 animate-tilt"></div>
              <div className="relative flex flex-col sm:flex-row items-center bg-background/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[1.5rem] shadow-2xl p-2 transition-all group-focus-within:border-primary/50 group-focus-within:bg-background/80">
                <div className="flex items-center flex-1 w-full sm:w-auto pl-4">
                  <Search className="text-muted-foreground w-6 h-6 shrink-0 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter Codeforces handle..."
                    className="flex-1 bg-transparent border-none outline-none py-4 px-4 text-lg md:text-xl text-foreground placeholder:text-muted-foreground/50 font-bold w-full"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 md:px-10 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Analyze Now
                </Button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-muted-foreground">
              <span className="uppercase tracking-widest opacity-60">Trending:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {["tourist", "Benq", "Egor", "Radewoosh", "jiangly"].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHandle(h)}
                    className="px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 transition-all duration-300"
                  >
                    {h}
                  </button>
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
                CFlytics turns abstract numbers into actionable intelligence. Experience the most advanced tracking engine in the competitive programming ecosystem.
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
                Join the elite circle of coders who use CFlytics to dominate their contests and track their legacy.
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
                <span className="text-2xl font-bold tracking-tight text-foreground">CFlytics</span>
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
              © {new Date().getFullYear()} CFlytics Intelligence. All Rights Reserved.
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
