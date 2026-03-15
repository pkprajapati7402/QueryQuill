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
} from "lucide-react";

/* ─── Mock Dashboard ─────────────────────────────────────────────────── */
function MockDashboard() {
  const bars = [72, 55, 88, 40, 95, 63, 78];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const colors = ["#6366f1", "#818cf8", "#6366f1", "#c7d2fe", "#4f46e5", "#818cf8", "#6366f1"];
  const linePoints = [68, 52, 75, 48, 82, 60, 74];
  const toSVGPath = (pts: number[]) =>
    pts.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 56 + 28},${100 - y}`).join(" ");

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-indigo-100/80 overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-yellow-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-[11px] text-gray-400 font-mono border border-gray-200">
          queryquill.app/dashboard
        </div>
      </div>
      <div className="p-5 space-y-4">
        {/* Query bar */}
        <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5">
          <MessageSquareText className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-sm text-indigo-700 font-medium">
            Show me monthly views by content category for Q3
          </span>
          <div className="ml-auto h-2 w-2 rounded-full bg-indigo-400 animate-ping-slow" />
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Views", value: "2.4M", delta: "+18%", color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Avg Likes",   value: "4,821", delta: "+9%",  color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Engagement",  value: "68.3%", delta: "+5%",  color: "text-pink-600",   bg: "bg-pink-50" },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-xl ${kpi.bg} px-3 py-2.5`}>
              <p className="text-[10px] text-gray-500 font-medium">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">{kpi.delta}</p>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 rounded-xl border border-gray-100 bg-white p-3">
            <p className="mb-2 text-[11px] font-semibold text-gray-800">Views by Month</p>
            <svg viewBox="0 0 392 110" className="w-full" preserveAspectRatio="none">
              {[25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={110 - y} x2="392" y2={110 - y} stroke="#f4f4f5" strokeWidth="1" />
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
          <div className="col-span-2 rounded-xl border border-gray-100 bg-white p-3">
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
        {/* Line chart */}
        <div className="rounded-xl border border-gray-100 bg-white p-3">
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

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-950 overflow-x-hidden">

      {/* ── Navbar (slate-950 — matches footer) ──────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-sm shadow-indigo-500/30">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">QueryQuill</span>
          </div>

          {/* Nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {[
              { label: "Features",    href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Tech Stack",   href: "#tech-stack" },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className="text-sm text-slate-400 transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:-translate-y-0.5">
            Go to Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero — two-column split ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pb-20 pt-16 lg:pb-28 lg:pt-24">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-orb-1 absolute left-[5%] top-[10%] h-[420px] w-[420px] rounded-full bg-indigo-100/70 blur-[100px]" />
          <div className="animate-orb-2 absolute right-[5%] top-[15%] h-[380px] w-[380px] rounded-full bg-violet-100/60 blur-[90px]" />
          <div className="absolute bottom-0 left-[35%] h-[260px] w-[260px] rounded-full bg-pink-100/50 blur-[80px]" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#6366f1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

            {/* ── Left: text content ─────────────────────────────────── */}
            <div className="flex flex-col items-start">
              {/* Badge */}
              <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Intelligent Analytics, Reimagined
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up delay-100 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
                Ask in English.
                <br />
                <span className="shimmer-text">Get Dashboards.</span>
              </h1>

              {/* Description */}
              <p className="animate-fade-up delay-200 mt-6 text-lg leading-relaxed text-gray-500">
                Turn plain English into fully interactive BI dashboards — instantly.
                No SQL, no configuration, no data team bottleneck. Just type and see it.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up delay-300 mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 hover:bg-indigo-500 hover:shadow-xl">
                  <Zap className="h-4 w-4" />
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-gray-800 transition-all hover:bg-gray-50">
                  See How It Works
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </a>
              </div>

              {/* Trust signals */}
              <div className="animate-fade-up delay-400 mt-8 flex flex-wrap items-center gap-5 text-sm text-gray-500">
                {["No signup required", "100% free", "Data stays in browser"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: dashboard preview ───────────────────────────── */}
            <div className="animate-fade-up delay-300 relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 -z-10 rounded-3xl bg-indigo-200/25 blur-[50px]" />

              {/* Floating badges */}
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

      {/* ── Stats (indigo-50) ─────────────────────────────────────────── */}
      <section className="border-y border-indigo-100 bg-indigo-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              { stat: "< 2s",  label: "Dashboard generation time" },
              { stat: "1M+",   label: "Rows handled per session" },
              { stat: "4",     label: "Chart types auto-selected" },
              { stat: "0",     label: "Lines of SQL you need to write" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient">{item.stat}</p>
                <p className="mt-1.5 text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (white) ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Simple Process</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-950">
              From question to dashboard in{" "}
              <span className="text-gradient">three steps</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No configuration. No SQL. No waiting. Just ask.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01", icon: Upload, title: "Upload Your Data",
                description: "Drag and drop any CSV file, or use the built-in sample dataset. Your data is parsed directly in the browser — nothing is ever sent to a server.",
                color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-100",
              },
              {
                step: "02", icon: MessageSquareText, title: "Ask in Plain English",
                description: "Type a business question naturally. \"Show revenue by region\" or \"Which category has the highest engagement?\" — exactly how you'd ask a colleague.",
                color: "text-violet-600", bg: "bg-violet-50", ring: "ring-violet-100",
              },
              {
                step: "03", icon: LayoutDashboard, title: "Get an Interactive Dashboard",
                description: "AI generates the query, picks the optimal chart types, and renders a fully interactive dashboard — with tooltips, insights, and follow-up chat.",
                color: "text-pink-600", bg: "bg-pink-50", ring: "ring-pink-100",
              },
            ].map((item, idx) => (
              <div key={item.step}
                className={`glow-card relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm ${idx < 2 ? "step-connector" : ""}`}>
                <div className="mb-5 flex items-center gap-4">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ring-4 ${item.ring}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span className="text-5xl font-extrabold text-gray-100 select-none">{item.step}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (slate-50) ──────────────────────────────────────── */}
      <section id="features" className="border-t border-gray-100 bg-slate-50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">Capabilities</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-950">
              Built for{" "}
              <span className="text-gradient">non-technical users</span>
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
                gradient: "from-indigo-50 to-violet-50", iconColor: "text-indigo-600", iconBg: "bg-indigo-100",
              },
              {
                icon: Database, title: "Any CSV, Instantly",
                desc: "Upload any CSV file. Data is parsed and queried locally in your browser with zero upload to any server.",
                gradient: "from-violet-50 to-purple-50", iconColor: "text-violet-600", iconBg: "bg-violet-100",
              },
              {
                icon: MessageSquareText, title: "Follow-Up Chat",
                desc: "Refine your dashboard conversationally. \"Now filter to only the East region\" or \"Show Q4 only\" — full context retained.",
                gradient: "from-pink-50 to-rose-50", iconColor: "text-pink-600", iconBg: "bg-pink-100",
              },
              {
                icon: Zap, title: "Real-Time Generation",
                desc: "From question to fully rendered dashboard in under 2 seconds. No loading screens, no waiting for data teams.",
                gradient: "from-amber-50 to-orange-50", iconColor: "text-amber-600", iconBg: "bg-amber-100",
              },
              {
                icon: Shield, title: "Privacy First",
                desc: "Your data never leaves your device. CSV parsing, query execution, and chart rendering all happen locally in the browser.",
                gradient: "from-emerald-50 to-teal-50", iconColor: "text-emerald-600", iconBg: "bg-emerald-100",
              },
              {
                icon: Activity, title: "Accuracy Guard",
                desc: "AI is strictly instructed to only reference columns that exist in your schema. It reports clearly when a question can't be answered.",
                gradient: "from-sky-50 to-cyan-50", iconColor: "text-sky-600", iconBg: "bg-sky-100",
              },
            ].map((feature) => (
              <div key={feature.title}
                className={`glow-card rounded-2xl border border-gray-200 bg-gradient-to-br ${feature.gradient} p-7`}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg}`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack (white) ────────────────────────────────────────── */}
      <section id="tech-stack" className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Built with modern open-source tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: "Next.js 16",       color: "bg-gray-100   text-gray-800" },
              { name: "React 19",          color: "bg-sky-50     text-sky-700" },
              { name: "Google AI",         color: "bg-indigo-50  text-indigo-700" },
              { name: "Recharts",          color: "bg-violet-50  text-violet-700" },
              { name: "Tailwind CSS v4",   color: "bg-cyan-50    text-cyan-700" },
              { name: "Papa Parse",        color: "bg-emerald-50 text-emerald-700" },
              { name: "TypeScript",        color: "bg-blue-50    text-blue-700" },
              { name: "Lucide Icons",      color: "bg-rose-50    text-rose-700" },
            ].map((tech) => (
              <span key={tech.name}
                className={`rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${tech.color}`}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 py-16 text-center shadow-2xl shadow-indigo-200 md:px-16">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10" />
          </div>
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90">
              <PieChart className="h-3.5 w-3.5" />
              No account needed — start in seconds
            </div>
            <h2 className="text-4xl font-extrabold text-white md:text-5xl">
              Ready to talk to your data?
            </h2>
            <p className="mt-4 text-lg text-indigo-200">
              Upload a CSV and ask your first question in under 30 seconds.
            </p>
            <Link href="/dashboard"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-indigo-700 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer (slate-950 — matches navbar) ──────────────────────── */}
      <footer className="border-t border-white/5 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-6 py-14">
          {/* Top grid */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">QueryQuill</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Conversational AI for instant business intelligence. Ask in plain English, get interactive dashboards — no SQL required.
              </p>
              {/* Social links */}
              <div className="mt-5 flex items-center gap-3">
                {[
                  { icon: Github,  href: "https://github.com", label: "GitHub" },
                  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                  { icon: Globe,   href: "#", label: "Website" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400">
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Product</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Dashboard",    href: "/dashboard" },
                  { label: "Features",     href: "#features" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Tech Stack",   href: "#tech-stack" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href}
                      className="transition-colors hover:text-white">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Resources</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "GitHub Repository", href: "https://github.com" },
                  { label: "Documentation",      href: "#" },
                  { label: "Sample Dataset",     href: "/sample-dataset.csv" },
                  { label: "Report an Issue",    href: "https://github.com" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-12 border-t border-white/5 pt-6 flex flex-col items-center justify-between gap-3 text-xs text-slate-600 sm:flex-row">
            <p>© {new Date().getFullYear()} QueryQuill. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="transition-colors hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-slate-400">Terms of Service</a>
              <a href="#" className="transition-colors hover:text-slate-400">MIT License</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
