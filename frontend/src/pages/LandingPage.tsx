import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  Bot,
  CreditCard,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  DollarSign,
  Search,
  ShoppingCart,
  Compass,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold shadow-sm">
              <Shield className="w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Pay<span className="text-emerald-700">Pilot</span>
            </span>
            <Badge variant="emerald" size="sm" className="hidden sm:inline-flex">
              PayPal AI Hackathon
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Core Features
            </a>
            <a href="#paypal-integration" className="hover:text-emerald-700 transition-colors">
              PayPal Integration
            </a>
            <a href="#security" className="hover:text-emerald-700 transition-colors">
              Security Guardrails
            </a>
            <NavLink to="/browse" className="hover:text-emerald-700 transition-colors">
              Catalog
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink to="/dashboard">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Dashboard
              </Button>
            </NavLink>
            <NavLink to="/ai-shopping">
              <Button size="sm" icon={<Bot className="w-4 h-4" />}>
                Start Shopping
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your AI. Your Budget. Your Purchase.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Your shopping, <br className="hidden sm:block" />
          <span className="text-emerald-700">on autopilot.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Tell PayPilot what you need. Your AI agent finds the right products, protects your budget
          and prepares your purchase through PayPal.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <NavLink to="/ai-shopping">
            <Button size="lg" icon={<Sparkles className="w-4 h-4" />}>
              Start Shopping
            </Button>
          </NavLink>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              See How It Works
            </Button>
          </a>
        </div>

        {/* 3. Product Demonstration Preview Widget */}
        <div className="mt-14 max-w-5xl mx-auto rounded-card-lg border border-slate-200/90 shadow-elevated bg-white p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-500 ml-2">
                PayPilot Split-Screen Copilot • Demo Scenario
              </span>
            </div>
            <Badge variant="emerald" size="sm">
              Sandbox Live
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
            {/* Left preview: Natural language prompt & extraction */}
            <div className="md:col-span-7 bg-slate-50/70 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  1. Natural Language Shopping Prompt
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-800 shadow-sm">
                  "Find wireless headphones for studying and travelling under $150 with active noise cancellation and long battery life."
                </div>

                <div className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  2. AI Structured Extraction & Budget Guard
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">CATEGORY</span>
                    <span className="font-semibold text-emerald-800">Headphones</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">BUDGET LIMIT</span>
                    <span className="font-semibold text-emerald-800">$150.00</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-bold">PREFERENCES</span>
                    <span className="font-semibold text-emerald-800">ANC, Battery Life</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> 160+ Catalog Products Scored
                </span>
                <NavLink to="/ai-shopping" className="text-emerald-700 font-bold hover:underline">
                  Launch Interactive Demo →
                </NavLink>
              </div>
            </div>

            {/* Right preview: Verified recommendation & PayPal checkout */}
            <div className="md:col-span-5 bg-white rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>3. Curated Match</span>
                  <Badge variant="emerald" size="sm">98% Match</Badge>
                </div>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80"
                      alt="Headphones"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">
                      Sony Pro Max 2026 Headphone
                    </h5>
                    <span className="text-sm font-extrabold text-slate-900 block mt-1">
                      $129.99
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      Within authorized $150 limit
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="w-full py-2 bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2 shadow-sm">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>PayPal Orders API v2 Checkout</span>
                </div>
                <span className="text-[10px] text-slate-500 text-center block mt-1.5">
                  Server-verified capture • Zero fake payments
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How PayPilot Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Autonomous Financial Flow
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              From natural thought to verified PayPal transaction
            </h3>
            <p className="mt-3 text-slate-600 text-sm">
              PayPilot separates artificial intelligence from financial control. AI finds the right
              products, the backend enforces mathematical rules, and you authorize the payment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-14">
            {[
              {
                step: '01',
                title: 'State Your Need',
                desc: 'Describe what you want in plain English. State your budget, preferred brands, or key specs.',
                icon: Bot,
              },
              {
                step: '02',
                title: 'AI Catalog Intelligence',
                desc: 'PayPilot extracts structured parameters and queries 160+ items across 10 categories with multi-factor ranking.',
                icon: Search,
              },
              {
                step: '03',
                title: 'Budget Guardrails',
                desc: 'Backend recalculates cart totals and prevents checkout if order exceeds your approved monthly limit.',
                icon: DollarSign,
              },
              {
                step: '04',
                title: 'PayPal Sandbox Checkout',
                desc: 'Checkout through official PayPal Orders API v2. Only verified captures appear as completed orders.',
                icon: CreditCard,
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-card bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        Step {item.step}
                      </span>
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Core Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Engineered for Precision
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
            Why PayPilot feels like real fintech
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              title: 'Split-Screen Copilot',
              desc: 'Continuous desktop split-screen view: AI dialogue on the left, live recommendation cards and budget meter on the right.',
              icon: Sliders,
            },
            {
              title: '160+ Product Catalog',
              desc: 'Realistic catalog across 10 tech categories with rich specifications, price filters, and side-by-side product comparisons.',
              icon: Compass,
            },
            {
              title: 'Strict Catalog Truth',
              desc: 'AI can answer questions about ANY product in the catalog, but answers strictly from database specs without hallucinating.',
              icon: CheckCircle2,
            },
            {
              title: 'Server-Side Budget Enforcement',
              desc: 'Your spending limit is guarded by backend middleware. AI cannot override totals or force payments beyond your cap.',
              icon: Lock,
            },
            {
              title: 'Official PayPal Orders v2',
              desc: 'Complete server-to-server OAuth 2.0 token management, order creation, capture verification, and duplicate capture prevention.',
              icon: CreditCard,
            },
            {
              title: 'Real Persisted Analytics',
              desc: 'Every order updates the PostgreSQL database. View authentic spending breakdown charts rendered with Recharts.',
              icon: DollarSign,
            },
          ].map(feat => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-card bg-white border border-slate-200 shadow-subtle hover:shadow-elevated transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PayPal Integration & Security Boundaries */}
      <section id="paypal-integration" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PayPal Developer Platform Integration</span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">
                Industrial-grade payment architecture with Orders API v2
              </h3>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                PayPilot strictly follows fintech security best practices:
              </p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Client Secrets on Frontend:</strong> PayPal Client Secret is held exclusively on the Express backend server.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Server Cart Recalculation:</strong> Cart totals and tax are recalculated from database snapshot prices before sending to PayPal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Duplicate Capture Prevention:</strong> Idempotent capture records prevent accidental duplicate transactions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Verified Capture Settlement:</strong> Orders are marked completed ONLY after the backend receives and verifies a 200/201 response from PayPal.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-card-lg p-6 border border-slate-700">
              <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
                <span>Core Architectural Principles</span>
                <Badge variant="emerald" size="sm">Boundaries</Badge>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">AI AGENT BOUNDARY</span>
                  <p className="text-slate-400">Handles requirement understanding, catalog matching, and recommendation explanation. Cannot capture payments, alter user budgets, or bypass review.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">BACKEND ENFORCEMENT</span>
                  <p className="text-slate-400">Validates schema, calculates mathematical totals, checks financial limits, and executes secure PayPal Orders API v2 transactions.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">USER CONTROL</span>
                  <p className="text-slate-400">User reviews every item, views the budget impact, and explicitly authorizes the PayPal checkout.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ready to experience the future of AI shopping?
        </h2>
        <p className="mt-4 text-slate-600 text-sm max-w-xl mx-auto">
          Try the PayPilot interactive copilot with full PayPal Sandbox integration.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <NavLink to="/ai-shopping">
            <Button size="lg" icon={<Sparkles className="w-4 h-4" />}>
              Launch AI Shopping Assistant
            </Button>
          </NavLink>
          <NavLink to="/browse">
            <Button variant="outline" size="lg" icon={<Compass className="w-4 h-4" />}>
              Browse Full Catalog
            </Button>
          </NavLink>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-800">PayPilot</span>
            <span>— Your AI. Your Budget. Your Purchase.</span>
          </div>
          <div>
            Built for the PayPal AI Hackathon • Sandbox Demonstration Only
          </div>
        </div>
      </footer>
    </div>
  );
};
