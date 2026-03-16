"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  MessageSquareText,
  Upload,
  Zap,
  ArrowRight,
  Database,
  BrainCircuit,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Activity,
  Sparkles,
  Shield,
  ChevronRight,
  Github,
  Twitter,
  Globe,
  LineChart,
  BarChart2,
  Cpu,
} from "lucide-react";

/* ─── Floating Particles ─────────────────────────────────────────────── */
function FloatingParticles({ count = 12, palette = "indigo" }: { count?: number; palette?: string }) {
  const palettes: Record<string, string[]> = {
    indigo: ["#6366f1","#8b5cf6","#ec4899","#6366f1","#a78bfa","#38bdf8","#34d399","#f472b6","#818cf8","#6366f1","#c084fc","#fb7185"],
    amber:  ["#f59e0b","#fb923c","#fbbf24","#ef4444","#f97316","#fcd34d","#fb923c","#f59e0b","#fde68a","#f59e0b","#fbbf24","#ef4444"],
    teal:   ["#06b6d4","#10b981","#34d399","#6366f1","#22d3ee","#4ade80","#06b6d4","#10b981","#38bdf8","#34d399","#059669","#06b6d4"],
    violet: ["#8b5cf6","#a855f7","#ec4899","#c084fc","#d946ef","#f472b6","#8b5cf6","#a78bfa","#e879f9","#c084fc","#8b5cf6","#f9a8d4"],
  };
  const colors = palettes[palette] ?? palettes.indigo;
  const configs = [
    { w: 8,  l: "6%",  dur: "14s", del: "0s"   },
    { w: 5,  l: "14%", dur: "10s", del: "1.8s"  },
    { w: 10, l: "23%", dur: "17s", del: "3.2s"  },
    { w: 6,  l: "33%", dur: "12s", del: "0.5s"  },
    { w: 8,  l: "42%", dur: "15s", del: "2.5s"  },
    { w: 5,  l: "52%", dur: "11s", del: "4.1s"  },
    { w: 9,  l: "62%", dur: "13s", del: "1.2s"  },
    { w: 7,  l: "71%", dur: "16s", del: "3.8s"  },
    { w: 6,  l: "79%", dur: "9s",  del: "0.9s"  },
    { w: 10, l: "87%", dur: "14s", del: "2.1s"  },
    { w: 5,  l: "93%", dur: "11s", del: "3.5s"  },
    { w: 7,  l: "97%", dur: "18s", del: "1.6s"  },
  ].slice(0, count);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      {configs.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{ width: p.w, height: p.w, left: p.l, bottom: "-20px",
            backgroundColor: colors[i % colors.length], opacity: 0,
            animation: `particle-float ${p.dur} ${p.del} ease-in-out infinite` }} />
      ))}
    </div>
  );
}

/* ─── Aurora orbs ────────────────────────────────────────────────────── */
function AuroraOrbs({ orbs }: { orbs: { color: string; size: number; pos: string; dur: string; del?: string }[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {orbs.map((o, i) => (
        <div key={i} className="animate-aurora absolute blur-[110px]"
          style={{ background: o.color, width: o.size, height: o.size,
            ...Object.fromEntries(o.pos.split(" ").map(p => p.split(":")) as [string,string][]),
            animationDuration: o.dur, animationDelay: o.del ?? "0s" }} />
      ))}
    </div>
  );
}

/* ─── Mock Dashboard ─────────────────────────────────────────────────── */
function MockDashboard() {
  const bars = [72, 55, 88, 40, 95, 63, 78];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const colors = ["#6366f1","#818cf8","#6366f1","#c7d2fe","#4f46e5","#818cf8","#6366f1"];
  const linePoints = [68, 52, 75, 48, 82, 60, 74];
  const toSVGPath = (pts: number[]) => pts.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 56 + 28},${100 - y}`).join(" ");
  return (
    <div className="w-full rounded-2xl border border-indigo-100 bg-white shadow-2xl shadow-indigo-200/60 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-yellow-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 rounded-md bg-white/80 px-3 py-1 text-[11px] text-gray-400 font-mono border border-indigo-100">
          queryquill.app/dashboard
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5">
          <MessageSquareText className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-sm text-indigo-700 font-medium">Show me monthly views by content category for Q3</span>
          <div className="ml-auto h-2 w-2 rounded-full bg-indigo-400 animate-ping-slow" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Views", value: "2.4M",  delta: "+18%", color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Avg Likes",   value: "4,821",  delta: "+9%",  color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Engagement",  value: "68.3%",  delta: "+5%",  color: "text-pink-600",   bg: "bg-pink-50" },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-xl ${kpi.bg} px-3 py-2.5`}>
              <p className="text-[10px] text-gray-500 font-medium">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">{kpi.delta}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 rounded-xl border border-indigo-50 bg-white p-3">
            <p className="mb-2 text-[11px] font-semibold text-gray-800">Views by Month</p>
            <svg viewBox="0 0 392 110" className="w-full" preserveAspectRatio="none">
              {[25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={110 - y} x2="392" y2={110 - y} stroke="#ede9fe" strokeWidth="1" />
              ))}
              {bars.map((h, i) => (
                <rect key={i} x={i * 56 + 10} y={110 - h} width={36} height={h} rx={4}
                  fill={colors[i]} opacity={0.85}
                  style={{ transformOrigin: `${i * 56 + 28}px 110px`, animation: `bar-grow 0.8s ease ${i * 0.1 + 0.2}s both` }} />
              ))}
              {labels.map((l, i) => (
                <text key={i} x={i * 56 + 28} y={108} textAnchor="middle" fontSize="8" fill="#9ca3af">{l}</text>
              ))}
            </svg>
          </div>
          <div className="col-span-2 rounded-xl border border-indigo-50 bg-white p-3">
            <p className="mb-2 text-[11px] font-semibold text-gray-800">By Category</p>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 80 80" className="w-16 h-16 shrink-0">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#6366f1" strokeWidth="16" strokeDasharray="90 100" strokeDashoffset="-10" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="55 100" strokeDashoffset="-100" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="#ec4899" strokeWidth="16" strokeDasharray="35 100" strokeDashoffset="-155" />
                <circle cx="40" cy="40" r="14" fill="white" />
              </svg>
              <div className="space-y-1">
                {[{ label: "Vlogs", color: "bg-indigo-500" }, { label: "Tech", color: "bg-violet-500" }, { label: "Music", color: "bg-pink-500" }].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-[10px] text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-indigo-50 bg-white p-3">
          <p className="mb-1 text-[11px] font-semibold text-gray-800">Engagement Trend</p>
          <svg viewBox="0 0 364 100" className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${toSVGPath(linePoints)} L 364,100 L 0,100 Z`} fill="url(#lineGrad)" />
            <path d={toSVGPath(linePoints)} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {linePoints.map((y, i) => (
              <circle key={i} cx={i * 56 + 28} cy={100 - y} r="3.5" fill="white" stroke="#6366f1" strokeWidth="2" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Floating badge ─────────────────────────────────────────────────── */
function FloatingBadge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute glass-card rounded-xl px-3 py-2 text-xs font-semibold shadow-lg ${className}`}>
      {children}
    </div>
  );
}

/* ─── Query Example Card ─────────────────────────────────────────────── */
function QueryCard({
  query, chartType, bgColor, borderColor, textColor, icon: Icon, chart, time, className = "",
}: {
  query: string; chartType: string; bgColor: string;
  borderColor: string; textColor: string; icon: React.ElementType;
  chart: React.ReactNode; time: string; className?: string;
}) {
  return (
    <div className={`card-3d group relative rounded-2xl border ${borderColor} bg-white p-5 shadow-md ${className}`}>
      {/* Query bubble */}
      <div className={`mb-4 rounded-xl ${bgColor} border ${borderColor} px-4 py-3`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <MessageSquareText className={`h-3 w-3 ${textColor}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${textColor} opacity-70`}>Natural Language Query</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 leading-snug">"{query}"</p>
      </div>
      {/* Mini chart */}
      <div className="relative overflow-hidden rounded-xl bg-gray-50 p-3 mb-4">
        {chart}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${bgColor}`}>
            <Icon className={`h-3.5 w-3.5 ${textColor}`} />
          </div>
          <span className="text-xs font-semibold text-gray-700">{chartType}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">⚡ {time}</span>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function Home() {
  /* Scroll-triggered reveal */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, []);
  return (
    <div className="min-h-screen text-gray-950 overflow-x-hidden" style={{ background: "#f8f7ff" }}>

      {/* ══ Navbar ════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur-xl shadow-sm shadow-indigo-100/50 border-b border-indigo-100/80">
        <div className="nav-gradient-border absolute bottom-0 left-0 right-0 h-[2px] opacity-50" />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-300/40">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">QueryQuill</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features",     href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Examples",     href: "#examples" },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className="nav-link text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600">
                {item.label}
              </a>
            ))}
          </div>
          <Link href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-300/40 transition-all hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200/50">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* ══ Hero ══════════════════════════════════════════════════════ */}
      <section suppressHydrationWarning className="relative overflow-hidden pb-20 pt-16 lg:pb-28 lg:pt-24"
        style={{ background: "linear-gradient(160deg, #eef2ff 0%, #f8f7ff 45%, #fdf4ff 100%)" }}>

        <AuroraOrbs orbs={[
          { color: "rgba(99,102,241,0.20)", size: 520, pos: "left:-10% top:5%",   dur: "14s" },
          { color: "rgba(139,92,246,0.16)", size: 440, pos: "right:0% top:10%",   dur: "18s", del: "4s" },
          { color: "rgba(236,72,153,0.13)", size: 380, pos: "left:30% bottom:5%", dur: "12s", del: "7s" },
          { color: "rgba(56,189,248,0.10)", size: 300, pos: "right:25% top:55%",  dur: "20s", del: "2s" },
        ]} />
        <div className="animated-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        {/* Dot pattern */}
        <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.04]">
          <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#6366f1" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <FloatingParticles count={12} palette="indigo" />

        {/* Decorative 3D rings */}
        <div className="pointer-events-none absolute right-[8%] top-[20%] -z-10 opacity-20 lg:opacity-30">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-400 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border-[2px] border-violet-400"
              style={{ animation: "spin 12s linear infinite reverse" }} />
            <div className="absolute inset-8 rounded-full border-[2px] border-pink-400 animate-spin-slow" />
            <div className="absolute inset-0 rounded-full"
              style={{ animation: "ring-expand 4s ease-out infinite", background: "rgba(99,102,241,0.08)" }} />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-start">
              <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm shadow-indigo-100 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Intelligent Analytics, Reimagined
              </div>
              <h1 className="animate-fade-up delay-100 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
                Ask in English.
                <br />
                <span className="shimmer-text">Get Dashboards.</span>
              </h1>
              <p className="animate-fade-up delay-200 mt-6 text-lg leading-relaxed text-gray-500">
                Turn plain English into fully interactive BI dashboards — instantly.
                No SQL, no configuration, no data team bottleneck. Just type and see it.
              </p>
              <div className="animate-fade-up delay-300 mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-300/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60">
                  <Zap className="h-4 w-4" />
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-7 py-3.5 text-base font-semibold text-gray-700 backdrop-blur-sm transition-all hover:bg-white hover:border-indigo-300 hover:text-indigo-700">
                  See How It Works
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </a>
              </div>
              <div className="animate-fade-up delay-400 mt-8 flex flex-wrap items-center gap-5 text-sm text-gray-500">
                {["No signup required", "100% free", "Data stays in browser"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />{item}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up delay-300 relative">
              <div className="absolute inset-0 -z-10 rounded-3xl blur-[60px]"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.18) 50%, rgba(236,72,153,0.12) 100%)" }} />
              <FloatingBadge className="animate-float absolute -left-4 top-12 z-10 flex items-center gap-2 sm:-left-8">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-gray-900">+24% Views this month</span>
              </FloatingBadge>
              <FloatingBadge className="animate-float-delayed absolute -right-4 top-1/3 z-10 flex items-center gap-2 sm:-right-6">
                <BrainCircuit className="h-4 w-4 text-indigo-500" />
                <span className="text-gray-900">AI picked Bar Chart</span>
              </FloatingBadge>
              <FloatingBadge className="animate-float-slow absolute -bottom-4 left-8 z-10 flex items-center gap-2">
                <Activity className="h-4 w-4 text-pink-500" />
                <span className="text-gray-900">Generated in 1.2s</span>
              </FloatingBadge>
              <MockDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* ══ Stats — DARK deep-indigo band ══════════════════════════════ */}
      <section className="relative overflow-hidden py-16"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 55%, #1a1040 100%)" }}>
        <div className="animated-grid-dark pointer-events-none absolute inset-0 opacity-100" />
        <AuroraOrbs orbs={[
          { color: "rgba(129,140,248,0.12)", size: 400, pos: "left:-5% top:-20%", dur: "16s" },
          { color: "rgba(167,139,250,0.10)", size: 350, pos: "right:-5% bottom:-10%", dur: "20s", del: "5s" },
        ]} />
        <FloatingParticles count={8} palette="violet" />

        {/* Decorative horizontal glowing line */}
        <div className="absolute left-0 right-0 top-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.6), rgba(196,181,253,0.8), rgba(129,140,248,0.6), transparent)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.4), rgba(196,181,253,0.6), rgba(129,140,248,0.4), transparent)" }} />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              { stat: "< 2s",  label: "Dashboard generation time",     icon: Zap },
              { stat: "1M+",   label: "Rows handled per session",       icon: Database },
              { stat: "4",     label: "Chart types auto-selected",      icon: BarChart3 },
              { stat: "0",     label: "Lines of SQL you need to write", icon: MessageSquareText },
            ].map((item, i) => (
              <div key={item.label} className={`reveal reveal-d${i + 1} text-center group`}>
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                  <item.icon className="h-5 w-5 text-indigo-300" />
                </div>
                <p className="text-4xl font-extrabold text-gradient-light">{item.stat}</p>
                <p className="mt-2 text-sm text-indigo-200/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ How It Works — WARM AMBER ══════════════════════════════════ */}
      <section id="how-it-works" className="relative overflow-hidden py-28"
        style={{ background: "linear-gradient(160deg, #fffbeb 0%, #fff7ed 55%, #fef3c7 100%)" }}>

        <AuroraOrbs orbs={[
          { color: "rgba(251,146,60,0.15)",  size: 400, pos: "right:-5% top:5%",    dur: "14s" },
          { color: "rgba(245,158,11,0.12)",  size: 340, pos: "left:-5% bottom:10%", dur: "18s", del: "5s" },
          { color: "rgba(239,68,68,0.08)",   size: 280, pos: "left:40% top:40%",    dur: "22s", del: "3s" },
        ]} />
        <div className="animated-grid-amber pointer-events-none absolute inset-0 opacity-70" />
        <FloatingParticles count={8} palette="amber" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-600">Simple Process</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-950">
              From question to dashboard in{" "}
              <span className="text-gradient-warm">three steps</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">No configuration. No SQL. No waiting. Just ask.</p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01", icon: Upload, title: "Upload Your Data",
                description: "Drag and drop any CSV file, or use the built-in sample dataset. Your data is parsed directly in the browser — nothing is ever sent to a server.",
                iconColor: "text-amber-600", iconBg: "bg-amber-50", iconRing: "ring-amber-100",
                cardBorder: "border-amber-100", numColor: "text-amber-100",
              },
              {
                step: "02", icon: MessageSquareText, title: "Ask in Plain English",
                description: "Type a business question naturally. \"Show revenue by region\" or \"Which category has the highest engagement?\" — exactly how you'd ask a colleague.",
                iconColor: "text-orange-600", iconBg: "bg-orange-50", iconRing: "ring-orange-100",
                cardBorder: "border-orange-100", numColor: "text-orange-100",
              },
              {
                step: "03", icon: LayoutDashboard, title: "Get an Interactive Dashboard",
                description: "AI generates the query, picks the optimal chart types, and renders a fully interactive dashboard — with tooltips, insights, and follow-up chat.",
                iconColor: "text-red-500", iconBg: "bg-red-50", iconRing: "ring-red-100",
                cardBorder: "border-red-100", numColor: "text-red-100",
              },
            ].map((item, idx) => (
              <div key={item.step}
                className={`reveal reveal-d${idx + 1} card-3d card-3d-warm relative rounded-2xl border ${item.cardBorder} bg-white/90 p-8 shadow-md backdrop-blur-sm ${idx < 2 ? "step-connector" : ""}`}>
                <div className="mb-5 flex items-center gap-4">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg} ring-4 ${item.iconRing}`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <span className={`text-5xl font-extrabold select-none ${item.numColor}`}>{item.step}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Features — FRESH TEAL/EMERALD ══════════════════════════════ */}
      <section id="features" className="relative overflow-hidden border-t border-emerald-100 py-10"
        style={{ background: "linear-gradient(155deg, #f0fdf4 0%, #ecfeff 55%, #eff6ff 100%)" }}>

        <AuroraOrbs orbs={[
          { color: "rgba(6,182,212,0.14)",   size: 380, pos: "left:10% top:5%",     dur: "16s" },
          { color: "rgba(16,185,129,0.12)",   size: 320, pos: "right:5% bottom:10%", dur: "20s", del: "6s" },
          { color: "rgba(99,102,241,0.08)",   size: 260, pos: "right:30% top:50%",   dur: "18s", del: "3s" },
        ]} />
        <div className="animated-grid-teal pointer-events-none absolute inset-0 opacity-70" />
        <FloatingParticles count={10} palette="teal" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-teal-600">Capabilities</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-950">
              Built for{" "}
              <span className="text-gradient-teal">non-technical users</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Every feature designed to close the gap between business questions and data answers.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BrainCircuit, title: "Smart Chart Selection",
                desc: "AI automatically picks the most appropriate visualization — line charts for trends, bar for comparisons, pie for proportions.",
                grad: "from-indigo-50 to-violet-50", iCol: "text-indigo-600", iBg: "bg-indigo-100", border: "border-indigo-100",
              },
              {
                icon: Database, title: "Any CSV, Instantly",
                desc: "Upload any CSV file. Data is parsed and queried locally in your browser with zero upload to any server.",
                grad: "from-violet-50 to-purple-50", iCol: "text-violet-600", iBg: "bg-violet-100", border: "border-violet-100",
              },
              {
                icon: MessageSquareText, title: "Follow-Up Chat",
                desc: "Refine your dashboard conversationally. \"Now filter to only the East region\" or \"Show Q4 only\" — full context retained.",
                grad: "from-pink-50 to-rose-50", iCol: "text-pink-600", iBg: "bg-pink-100", border: "border-pink-100",
              },
              {
                icon: Zap, title: "Real-Time Generation",
                desc: "From question to fully rendered dashboard in under 2 seconds. No loading screens, no waiting for data teams.",
                grad: "from-amber-50 to-orange-50", iCol: "text-amber-600", iBg: "bg-amber-100", border: "border-amber-100",
              },
              {
                icon: Shield, title: "Privacy First",
                desc: "Your data never leaves your device. CSV parsing, query execution, and chart rendering all happen locally in the browser.",
                grad: "from-emerald-50 to-teal-50", iCol: "text-emerald-600", iBg: "bg-emerald-100", border: "border-emerald-100",
              },
              {
                icon: Activity, title: "Accuracy Guard",
                desc: "AI is strictly instructed to only reference columns that exist in your schema. It reports clearly when a question can't be answered.",
                grad: "from-sky-50 to-cyan-50", iCol: "text-sky-600", iBg: "bg-sky-100", border: "border-sky-100",
              },
            ].map((feature, i) => (
              <div key={feature.title}
                className={`reveal reveal-d${i + 1} card-3d card-3d-teal rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.grad} p-7 shadow-sm`}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.iBg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.iCol}`} />
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Examples — LAVENDER/VIOLET-PINK ════════════════════════════ */}
      <section id="examples" className="relative overflow-hidden border-t border-violet-100 py-28"
        style={{ background: "linear-gradient(135deg, #faf5ff 0%, #fdf2ff 40%, #fce7f3 100%)" }}>

        <AuroraOrbs orbs={[
          { color: "rgba(168,85,247,0.14)",  size: 420, pos: "left:-5% top:10%",   dur: "15s" },
          { color: "rgba(236,72,153,0.12)",  size: 360, pos: "right:-5% top:20%",  dur: "19s", del: "5s" },
          { color: "rgba(99,102,241,0.10)",  size: 300, pos: "left:35% bottom:5%", dur: "17s", del: "3s" },
        ]} />
        <div className="animated-grid pointer-events-none absolute inset-0 opacity-40" />
        <FloatingParticles count={10} palette="violet" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="reveal mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-600">Live Examples</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-950">
              Ask anything.{" "}
              <span className="text-gradient">Get a chart.</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From simple summaries to complex comparisons — if you can phrase it, QueryQuill can chart it.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 — Line Chart */}
            <QueryCard
              className="reveal reveal-d1"
              query="Show monthly revenue trend for 2024"
              chartType="Line Chart"
              bgColor="bg-indigo-50"
              borderColor="border-indigo-100"
              textColor="text-indigo-500"
              icon={LineChart}
              time="0.8s"
              chart={
                <svg viewBox="0 0 200 70" className="w-full h-16" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lf1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,70 L0,48 C25,48 40,22 60,26 S90,12 120,16 S155,36 200,22 L200,70 Z" fill="url(#lf1)" />
                  <path d="M0,48 C25,48 40,22 60,26 S90,12 120,16 S155,36 200,22"
                    fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"
                    style={{ strokeDasharray: 380, strokeDashoffset: 380, animation: "wave-draw 1.8s 0.3s ease forwards" }} />
                  {[{x:0,y:48},{x:60,y:26},{x:120,y:16},{x:200,y:22}].map((pt,i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="white" stroke="#6366f1" strokeWidth="2" />
                  ))}
                </svg>
              }
            />

            {/* Card 2 — Bar Chart */}
            <QueryCard
              className="reveal reveal-d2"
              query="Which product category has the most sales?"
              chartType="Bar Chart"
              bgColor="bg-violet-50"
              borderColor="border-violet-100"
              textColor="text-violet-500"
              icon={BarChart2}
              time="0.6s"
              chart={
                <svg viewBox="0 0 200 70" className="w-full h-16" preserveAspectRatio="none">
                  {[
                    { x: 10, h: 50, c: "#6366f1" },
                    { x: 47, h: 35, c: "#8b5cf6" },
                    { x: 84, h: 58, c: "#a78bfa" },
                    { x: 121, h: 28, c: "#c084fc" },
                    { x: 158, h: 44, c: "#6366f1" },
                  ].map((b, i) => (
                    <rect key={i} x={b.x} y={70 - b.h} width={28} height={b.h} rx={3} fill={b.c} opacity={0.85}
                      style={{ transformOrigin: `${b.x + 14}px 70px`, animation: `bar-appear 0.5s ${i * 0.12 + 0.2}s ease forwards`, transform: "scaleY(0)", opacity: 0 }} />
                  ))}
                </svg>
              }
            />

            {/* Card 3 — Donut Chart */}
            <QueryCard
              className="reveal reveal-d3"
              query="Break down revenue by region for Q3"
              chartType="Donut Chart"
              bgColor="bg-pink-50"
              borderColor="border-pink-100"
              textColor="text-pink-500"
              icon={PieChart}
              time="1.1s"
              chart={
                <svg viewBox="0 0 100 70" className="w-full h-16">
                  <circle cx="50" cy="35" r="25" fill="none" stroke="#fce7f3" strokeWidth="14" />
                  <circle cx="50" cy="35" r="25" fill="none" stroke="#ec4899" strokeWidth="14"
                    strokeDasharray="75 157" strokeDashoffset="39"
                    style={{ animation: "donut-spin 1.4s 0.2s ease forwards", strokeDashoffset: 157 }} />
                  <circle cx="50" cy="35" r="25" fill="none" stroke="#8b5cf6" strokeWidth="14"
                    strokeDasharray="50 157" strokeDashoffset="-36"
                    style={{ animation: "donut-spin 1.4s 0.5s ease forwards", strokeDashoffset: 157 }} />
                  <circle cx="50" cy="35" r="25" fill="none" stroke="#6366f1" strokeWidth="14"
                    strokeDasharray="32 157" strokeDashoffset="-86"
                    style={{ animation: "donut-spin 1.4s 0.8s ease forwards", strokeDashoffset: 157 }} />
                  <circle cx="50" cy="35" r="14" fill="white" />
                  <text x="50" y="39" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6b7280">3 Regions</text>
                </svg>
              }
            />

            {/* Card 4 — Scatter Plot */}
            <QueryCard
              className="reveal reveal-d4"
              query="Correlation between ad spend and conversions"
              chartType="Scatter Plot"
              bgColor="bg-teal-50"
              borderColor="border-teal-100"
              textColor="text-teal-600"
              icon={Cpu}
              time="1.4s"
              chart={
                <svg viewBox="0 0 200 70" className="w-full h-16" preserveAspectRatio="none">
                  {/* Trend line */}
                  <line x1="10" y1="60" x2="190" y2="10" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                  {/* Scatter points */}
                  {[{x:20,y:55},{x:35,y:48},{x:50,y:44},{x:65,y:38},{x:80,y:35},{x:95,y:30},
                    {x:110,y:26},{x:125,y:22},{x:145,y:18},{x:160,y:14},{x:175,y:12}].map((pt,i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#06b6d4" opacity={0.7}
                      style={{ animation: `fade-in 0.3s ${i * 0.08 + 0.2}s ease forwards`, opacity: 0 }} />
                  ))}
                </svg>
              }
            />
          </div>

          {/* Bottom CTA link */}
          <div className="reveal mt-12 text-center">
            <Link href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white/80 px-8 py-3.5 text-base font-semibold text-violet-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:border-violet-400 hover:-translate-y-1 hover:shadow-lg">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Try it with your own data
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      

      {/* ══ Footer ════════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #0f0b2e 0%, #1a0e47 52%, #0d1540 100%)" }}>

        {/* Animated gradient top accent */}
        <div className="nav-gradient-border h-[2px] w-full" />

        {/* Background ambiance */}
        <AuroraOrbs orbs={[
          { color: "rgba(99,102,241,0.12)",  size: 500, pos: "left:-10% top:-20%",    dur: "18s" },
          { color: "rgba(139,92,246,0.09)",  size: 400, pos: "right:-5% bottom:-20%", dur: "22s", del: "6s" },
          { color: "rgba(236,72,153,0.06)",  size: 300, pos: "left:40% top:30%",      dur: "16s", del: "3s" },
        ]} />
        <div className="animated-grid-dark absolute inset-0 opacity-80" />

        {/* ── Scrolling query ticker ──────────────────────────────── */}
        <div className="border-b border-white/5 bg-white/[0.02] py-3 overflow-hidden">
          <div className="animate-marquee flex items-center select-none">
            {[
              { q: "Show revenue by region",            type: "Bar Chart",     dot: "#6366f1" },
              { q: "Monthly engagement trend for Q3",   type: "Line Chart",    dot: "#8b5cf6" },
              { q: "Top 5 products by conversion rate", type: "Bar Chart",     dot: "#ec4899" },
              { q: "Break down sales by customer age",  type: "Donut Chart",   dot: "#06b6d4" },
              { q: "Ad spend vs conversion uplift",     type: "Scatter Plot",  dot: "#10b981" },
              { q: "Compare Q3 vs Q4 YoY growth",       type: "Grouped Bar",   dot: "#f59e0b" },
              /* duplicate for seamless loop */
              { q: "Show revenue by region",            type: "Bar Chart",     dot: "#6366f1" },
              { q: "Monthly engagement trend for Q3",   type: "Line Chart",    dot: "#8b5cf6" },
              { q: "Top 5 products by conversion rate", type: "Bar Chart",     dot: "#ec4899" },
              { q: "Break down sales by customer age",  type: "Donut Chart",   dot: "#06b6d4" },
              { q: "Ad spend vs conversion uplift",     type: "Scatter Plot",  dot: "#10b981" },
              { q: "Compare Q3 vs Q4 YoY growth",       type: "Grouped Bar",   dot: "#f59e0b" },
            ].map((item, i) => (
              <div key={i} className="flex shrink-0 items-center gap-2.5 px-5 text-xs whitespace-nowrap">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.dot }} />
                <MessageSquareText className="h-3 w-3 text-indigo-400/60 shrink-0" />
                <span className="text-white/50 italic">"{item.q}"</span>
                <span className="text-indigo-400/50 mx-0.5">→</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium"
                  style={{ color: item.dot }}>{item.type}</span>
                <span className="ml-3 text-white/10">|</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main footer content ─────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 lg:grid-cols-12">

            {/* Brand + mini chart — col-span-5 */}
            <div className="lg:col-span-5">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="animate-logo-glow absolute inset-0 rounded-xl bg-indigo-500/50 blur-lg" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/60">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-white">QueryQuill</div>
                  <div className="text-[10px] font-semibold tracking-[0.15em] text-indigo-400 uppercase">AI-Powered Analytics</div>
                </div>
              </div>

              <p className="mt-5 max-w-xs text-sm leading-relaxed text-indigo-200/55">
                Ask in plain English. Get interactive BI dashboards instantly — no SQL, no config, no data team bottleneck.
              </p>

              {/* Social icons */}
              <div className="mt-6 flex items-center gap-2.5">
                {[
                  { icon: Github,  href: "https://github.com",  label: "GitHub",  hov: "hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-300" },
                  { icon: Twitter, href: "https://twitter.com", label: "Twitter", hov: "hover:bg-sky-500/20    hover:border-sky-500/40    hover:text-sky-300"    },
                  { icon: Globe,   href: "#",                    label: "Website", hov: "hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-300" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-400 transition-all hover:-translate-y-0.5 ${s.hov}`}>
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              {/* Mini animated bar chart widget */}
              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">Dashboards Generated</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping-slow" />
                    <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                  </div>
                </div>
                <svg viewBox="0 0 200 52" className="w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="fbarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  {[12, 26, 40].map(y => (
                    <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  {[
                    { x: 4,   h: 30, c: "#6366f1", del: "0s"    },
                    { x: 32,  h: 20, c: "#8b5cf6", del: "0.1s"  },
                    { x: 60,  h: 40, c: "#6366f1", del: "0.2s"  },
                    { x: 88,  h: 15, c: "#a78bfa", del: "0.3s"  },
                    { x: 116, h: 46, c: "#6366f1", del: "0.4s"  },
                    { x: 144, h: 28, c: "#8b5cf6", del: "0.5s"  },
                    { x: 172, h: 36, c: "#6366f1", del: "0.6s"  },
                  ].map((b, i) => (
                    <rect key={i} x={b.x} y={52 - b.h} width={22} height={b.h} rx={3}
                      fill={b.c} opacity={0.85}
                      style={{ transformOrigin: `${b.x + 11}px 52px`, animation: `bar-grow 0.9s ${b.del} cubic-bezier(0.22,1,0.36,1) both` }} />
                  ))}
                </svg>
                <div className="mt-1.5 flex justify-between text-[9px] text-white/20 font-mono">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Product links — col-span-3 */}
            <div className="lg:col-span-3">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-indigo-400">Product</p>
              <ul className="space-y-3.5">
                {[
                  { label: "Dashboard",    href: "/dashboard",    dot: "bg-indigo-500" },
                  { label: "Features",     href: "#features",     dot: "bg-violet-500" },
                  { label: "How It Works", href: "#how-it-works", dot: "bg-pink-500"   },
                  { label: "Examples",     href: "#examples",     dot: "bg-sky-400"    },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      className="group flex items-center gap-2.5 text-sm text-indigo-200/50 transition-all duration-200 hover:text-white">
                      <div className={`h-1.5 w-1.5 rounded-full ${link.dot} shrink-0 opacity-50 transition-opacity group-hover:opacity-100`} />
                      <span>{link.label}</span>
                      <ChevronRight className="h-3 w-3 -translate-x-1 opacity-0 text-indigo-400 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources — col-span-3 */}
            <div className="lg:col-span-3">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-violet-400">Resources</p>
              <ul className="space-y-3.5">
                {[
                  { label: "GitHub Repository", href: "https://github.com",     dot: "bg-emerald-400" },
                  { label: "Documentation",      href: "#",                       dot: "bg-amber-400"   },
                  { label: "Sample Dataset",     href: "/sample-dataset.csv",    dot: "bg-pink-400"    },
                  { label: "Report an Issue",    href: "https://github.com",     dot: "bg-rose-400"    },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 text-sm text-indigo-200/50 transition-all duration-200 hover:text-white">
                      <div className={`h-1.5 w-1.5 rounded-full ${link.dot} shrink-0 opacity-50 transition-opacity group-hover:opacity-100`} />
                      <span>{link.label}</span>
                      <ChevronRight className="h-3 w-3 -translate-x-1 opacity-0 text-violet-400 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ───────────────────────────────────────── */}
          <div className="mt-14 border-t border-white/[0.07] pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-xs text-white/25">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/20">
                <BarChart3 className="h-3 w-3 text-indigo-400" />
              </div>
              <p suppressHydrationWarning>
                © {new Date().getFullYear()} QueryQuill — Built for data-driven teams.
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/25">
              <a href="#" className="transition-colors hover:text-indigo-300">Privacy</a>
              <a href="#" className="transition-colors hover:text-indigo-300">Terms</a>
              <a href="#" className="transition-colors hover:text-indigo-300">MIT License</a>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, rgba(9,5,30,0.5), transparent)" }} />
      </footer>
    </div>
  );
}
