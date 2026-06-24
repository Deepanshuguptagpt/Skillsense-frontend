'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Target,
  Users,
  TrendingUp,
  FileText,
  Briefcase,
  Sparkles,
  Brain,
  Github,
  BookOpen,
  BarChart3,
  Zap,
  CheckCircle,
  X,
  Check,
} from 'lucide-react';
import { APP_ROUTES } from '@/lib/constants';
import HeroSkillGraph from '@/components/HeroSkillGraph';

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <div className="fixed left-0 right-0 top-4 z-50 px-6">
      <header className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/40 bg-white/70 px-6 py-3 shadow-lg shadow-violet-900/5 backdrop-blur-xl">
        {/* Logo */}
        <Link href="/landing" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-glow-primary transition-transform group-hover:scale-105">
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-sora text-lg font-bold tracking-tight text-slate-900">
            Skill<span className="text-violet-600">Sense</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {['Home', 'How it works', 'Features'].map((item) => (
            <Link key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="rounded-full px-5 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-white hover:text-violet-600 hover:shadow-sm">
              {item}
            </Link>
          ))}
        </nav>

        {/* Auth CTAs */}
        <div className="flex items-center gap-3">
          <Link href={APP_ROUTES.SIGNIN} className="hidden px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:text-violet-600 sm:block">
            Sign In
          </Link>
          <Link href={APP_ROUTES.SIGNUP} className="group flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-violet-600 hover:shadow-glow-primary hover:-translate-y-0.5">
            Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white pb-32 pt-16 lg:pt-24">
      {/* Background with Grid and Floating Orbs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#FAFBFF]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf61a_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf61a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="absolute left-[-10%] top-[-10%] h-[600px] w-[600px] rounded-full bg-violet-400/20 blur-[120px] animate-float" />
        <div className="absolute right-[-5%] top-[20%] h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[20%] h-[700px] w-[700px] rounded-full bg-fuchsia-400/10 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* ── Left: Text Content ── */}
          <div className="flex flex-col items-start pt-12 lg:pt-0">
            {/* Badge pill */}
            <div className="group relative mb-8 inline-flex animate-fade-in items-center gap-2.5 rounded-full px-5 py-2 shadow-sm backdrop-blur-md transition-all hover:scale-105 cursor-default">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 p-[1.5px] opacity-70 transition-opacity group-hover:opacity-100">
                <div className="h-full w-full rounded-full bg-white/95 backdrop-blur-sm" />
              </div>
              <div className="relative flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.8)] animate-pulse" />
                <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-indigo-700">AI-Powered Skill Matching</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-sora text-5xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[4.5rem] animate-slide-up" style={{ animationDelay: '100ms' }}>
              Know exactly which{' '}
              <br className="hidden sm:block" />
              <span className="text-violet-600">
                Internship
              </span>
              <br className="hidden sm:block" />
              {' '}you qualify for
            </h1>

            {/* Subtitle */}
            <p className="mt-8 max-w-lg text-lg font-medium leading-relaxed text-slate-600 animate-slide-up" style={{ animationDelay: '200ms' }}>
              SkillSense builds your skill profile from real evidence (resume, GitHub, projects) and matches you with internships. <span className="text-slate-900 font-bold">Stop guessing, start applying.</span>
            </p>



            {/* CTAs */}
            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center animate-slide-up" style={{ animationDelay: '400ms' }}>
              <Link
                href={APP_ROUTES.SIGNUP}
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(124,58,237,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-2">Get Started Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
              <Link
                href="#how-it-works"
                className="group flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white/50 px-8 py-4 text-base font-bold text-slate-700 backdrop-blur-sm transition-all hover:border-violet-300 hover:bg-white hover:text-violet-700 hover:-translate-y-1"
              >
                See how it works
              </Link>
            </div>

          </div>

          {/* ── Right: Live Skill Graph ── */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-in" style={{ height: '700px', animationDelay: '300ms' }}>
            <HeroSkillGraph />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Problem Section ───────────────────────────────────────────────────────────
function ProblemSection() {
  const problems = [
    {
      icon: Target,
      title: 'No readiness signal',
      desc: 'Students apply to 40+ internships with no idea if their skills match. 80% go nowhere.',
      fail: 'Applied to 38 roles, 2 replies',
      success: 'Apply only to roles you qualify for',
    },
    {
      icon: TrendingUp,
      title: 'Skills are self-reported',
      desc: "Recruiters can't trust resume lists (no evidence layer). Everyone claims Python.",
      fail: '"Python" on 95% of resumes',
      success: 'Python verified 84% via quiz + GitHub',
    },
    {
      icon: Users,
      title: 'No path to close gaps',
      desc: "Motivated students don't know which 2–3 skills to build to become eligible.",
      fail: '"Learn everything, hope for best"',
      success: 'Exact gap + personalized roadmap',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-900 py-32 text-white">
      {/* Background glow */}
      <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[150px]" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-violet-400">
            The Problem
          </p>
          <h2 className="font-sora text-4xl font-bold tracking-tight sm:text-5xl">
            Students apply blind.<br />
            <span className="text-slate-400">Recruiters screen manually.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-400">
            Three broken links in the hiring chain. Here&apos;s how SkillSense fixes them.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, desc, fail, success }) => (
            <div
              key={title}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)]"
            >
              <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl transition-all duration-500 group-hover:bg-violet-500/40" />
              
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 ring-1 ring-white/10">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">
                {title}
              </h3>
              <p className="mb-10 flex-1 text-base leading-relaxed text-slate-400">
                {desc}
              </p>
              <div className="space-y-4 border-t border-white/10 pt-8">
                <p className="flex items-start gap-3 text-sm font-medium text-slate-400">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" /> {fail}
                </p>
                <p className="flex items-start gap-3 text-sm font-bold text-emerald-400">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {success}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Upload your resume',
      badge: 'Auto-extract',
      desc: 'NLP parser extracts every skill (languages, frameworks, tools) in seconds.',
    },
    {
      num: '02',
      title: 'Connect GitHub',
      badge: 'Real evidence',
      desc: 'OAuth scan reads your repos and detects your real tech stack. Evidence score: 0.6–0.7.',
    },
    {
      num: '03',
      title: 'Verify with quizzes',
      badge: 'Verified',
      desc: 'Role-specific AI quizzes push verified skills to 0.8 confidence.',
    },
    {
      num: '04',
      title: 'Get your readiness score',
      badge: 'Precise match',
      desc: "A 0–100% score computed against your target role's requirements. No more guessing.",
    },
    {
      num: '05',
      title: 'Follow your roadmap',
      badge: 'Close the gap',
      desc: 'SkillGenie identifies your top 3 gaps and generates a step-by-step learning path.',
    },
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-slate-50 py-32">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-[10%] top-0 h-[800px] w-[800px] rounded-full bg-violet-200/40 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[10%] h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-[100px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-24 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-violet-600">
            How it works
          </p>
          <h2 className="font-sora text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            From signup to internship match<br />in under 10 minutes
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative mt-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {steps.map((step, i) => (
              <div key={step.num} className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:border-violet-300 hover:shadow-xl">
                
                {/* Decorative Background Number */}
                <div className="absolute -right-6 -top-6 select-none text-[100px] font-black text-slate-900/5 transition-transform duration-500 group-hover:scale-110 pointer-events-none">
                  {step.num}
                </div>

                <div className="relative z-10 mb-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100/50 text-xl font-bold text-violet-600 transition-colors duration-300 group-hover:bg-violet-600 group-hover:text-white shadow-sm border border-violet-100">
                    {step.num}
                  </div>
                  <span className="mb-4 inline-block rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                    {step.badge}
                  </span>
                  <h3 className="text-xl font-bold leading-tight text-slate-900">{step.title}</h3>
                </div>
                
                <p className="relative z-10 mt-auto text-sm font-medium leading-relaxed text-slate-600">
                  {step.desc}
                </p>

                {/* Arrow pointing to next step (Desktop only) */}
                {i !== steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center md:flex z-20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-transform group-hover:scale-110">
                      <ArrowRight className="h-4 w-4 text-violet-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Evidence System Section ─────────────────────────────────────────────────────
function EvidenceSystemSection() {
  const sources = [
    {
      icon: FileText,
      title: 'Resume',
      weight: '0.3 weight',
      badge: 'Claimed',
      color: 'text-slate-400',
      bg: 'bg-slate-800/80',
      border: 'border-slate-700',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      desc: "AI parses your resume and extracts skills. Low confidence (it's just text).",
    },
    {
      icon: Github,
      title: 'GitHub',
      weight: '0.6 weight',
      badge: 'Detected',
      color: 'text-indigo-400',
      bg: 'bg-indigo-900/30',
      border: 'border-indigo-800/50',
      badgeColor: 'bg-indigo-900/40 text-indigo-300 border-indigo-800/50',
      desc: "Repo scan detects languages and frameworks from actual code you've written.",
    },
    {
      icon: Briefcase,
      title: 'Projects',
      weight: '0.5 weight',
      badge: 'Applied',
      color: 'text-orange-400',
      bg: 'bg-orange-900/30',
      border: 'border-orange-800/50',
      badgeColor: 'bg-orange-900/40 text-orange-300 border-orange-800/50',
      desc: "Completed projects on SkillSense add applied evidence (you built something real).",
    },
    {
      icon: Brain,
      title: 'Quiz',
      weight: '0.8 weight',
      badge: 'Tested',
      color: 'text-cyan-400',
      bg: 'bg-cyan-900/30',
      border: 'border-cyan-800/50',
      badgeColor: 'bg-cyan-900/40 text-cyan-300 border-cyan-800/50',
      desc: "AI-adaptive quizzes test real understanding. Pass rate maps to confidence.",
    },
    {
      icon: CheckCircle,
      title: 'Milestone',
      weight: '0.9 weight',
      badge: 'Proven',
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/30',
      border: 'border-emerald-800/50',
      badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/50',
      desc: "Complete a milestone and pass its assessment. Highest weight: 0.9.",
    },
  ];

  return (
    <section className="relative bg-[#0B0F19] py-32 overflow-hidden border-t border-slate-800">
      {/* Background glow */}
      <div className="absolute top-0 right-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-violet-400">
            The Evidence System
          </p>
          <h2 className="font-sora text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Skills ranked by how you<br />proved them
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-400">
            Every skill carries a confidence weight based on its evidence source. Quiz-verified skills count 2.7x more than a resume claim.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {sources.map(({ icon: Icon, title, weight, badge, color, bg, border, badgeColor, desc }) => (
            <div key={title} className="group relative flex flex-col rounded-[2rem] border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 shadow-sm transition-all duration-300 hover:shadow-glow-primary hover:-translate-y-2 hover:border-slate-700">
              <div className="mb-8 flex items-center justify-between">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${bg} ring-1 ${border} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeColor} shadow-sm`}>
                  {badge}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
              <p className={`mb-5 text-sm font-extrabold ${color}`}>{weight}</p>
              <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features Section ──────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: 'Resume AI Parser',
      desc: 'Upload your resume and our AI instantly extracts and categorizes every skill (programming languages, frameworks, tools and more).',
      highlight: false,
    },
    {
      icon: BarChart3,
      title: 'Skill Gap Analysis',
      desc: 'See exactly which skills are missing for each internship, with severity ratings (Critical / Moderate / Minor) and your current vs required proficiency.',
      highlight: false,
    },
    {
      icon: Briefcase,
      title: 'Internship Eligibility Score',
      desc: 'Every internship is scored 0–100 against your profile. Eligible (≥80%), Close (55–79%), and Not Yet. No guessing.',
      highlight: false,
    },
    {
      icon: Sparkles,
      title: 'SkillGenie AI Chat',
      desc: 'Ask anything about your career path. SkillGenie knows your skills, gaps and target role, giving you personalised answers, not generic advice.',
      highlight: true,
    },
    {
      icon: BookOpen,
      title: 'Learning Path Generator',
      desc: 'For every missing skill, get a step-by-step learning roadmap with curated free resources, estimated time, and milestones to track progress.',
      highlight: false,
    },
    {
      icon: Github,
      title: 'GitHub Project Analyser',
      desc: 'Connect GitHub and we automatically analyse your repos to extract real tech stack evidence that strengthens your profile.',
      highlight: false,
    },
  ];

  return (
    <section id="features" className="bg-[#FAFBFF] py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-20 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-violet-600">
              Platform features
            </p>
            <h2 className="font-sora text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Everything you need to land
              <br />
              the right internship
            </h2>
          </div>
          <Link
            href={APP_ROUTES.SIGNUP}
            className="group flex shrink-0 items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg hover:-translate-y-1 ring-1 ring-slate-200"
          >
            Get started free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, highlight }) => (
            <div
              key={title}
              className={`group relative overflow-hidden rounded-[2rem] border p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-strong ${
                highlight 
                  ? 'border-violet-200 bg-gradient-to-b from-violet-50/50 to-white hover:border-violet-400' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {highlight && (
                <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl" />
              )}
              
              <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                highlight ? 'bg-violet-600 text-white shadow-glow-primary scale-110' : 'bg-slate-100 text-slate-700 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-glow-primary group-hover:scale-110'
              }`}>
                <Icon className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-900">
                {title}
              </h3>
              <p className="mb-8 text-base leading-relaxed text-slate-500">
                {desc}
              </p>
              {highlight && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-2 text-xs font-bold text-violet-800 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-10 py-28 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -left-[10%] -top-[50%] h-[1000px] w-[1000px] animate-float rounded-full bg-gradient-to-br from-violet-600/50 via-fuchsia-600/30 to-transparent blur-[120px]" />
            <div className="absolute -bottom-[50%] -right-[10%] h-[1000px] w-[1000px] animate-float rounded-full bg-gradient-to-tl from-indigo-600/50 via-cyan-600/30 to-transparent blur-[120px]" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-md shadow-lg">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse" />
              <span className="text-sm font-bold text-white tracking-wide">Accepting new students</span>
            </div>
            <h2 className="font-sora text-5xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.1]">
              Ready to find your perfect<br />internship match?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-300">
              Join thousands of engineering students who know exactly which
              internships they qualify for — and what to learn next.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Link href={APP_ROUTES.SIGNUP}
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white px-10 py-5 text-lg font-bold text-slate-900 transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                <span className="relative z-10 flex items-center gap-2">Create Free Account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
              <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-sora text-xl font-bold tracking-tight text-slate-900">
              SkillSense
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it works', href: '#how-it-works' },
              { label: 'Sign In', href: APP_ROUTES.SIGNIN },
              { label: 'Sign Up', href: APP_ROUTES.SIGNUP },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-base font-bold text-slate-500 transition-colors hover:text-violet-600"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200/60 pt-8">
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} SkillSense. Evidence-based internship
            matching for engineering students.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-violet-200 selection:text-violet-900">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <EvidenceSystemSection />
      <FeaturesSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
