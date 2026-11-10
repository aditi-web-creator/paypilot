import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Play,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Bot,
  Terminal,
  ExternalLink,
  Code2,
  DollarSign,
  Search,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const HelpGuidePage: React.FC = () => {
  const navigate = useNavigate();

  const scenarios = [
    {
      id: 'headphones',
      title: 'Official Hackathon Judging Scenario: Headphones with ANC',
      prompt: 'PayPilot, find me wireless headphones for studying and travelling. My maximum budget is $150. Prioritize battery life and noise cancellation.',
      budget: '$150.00',
      expectedFlow: [
        'AI extracts requirements: Category (Headphones), Budget ($150), Specs (ANC, Battery Life)',
        'Backend queries 380+ items in catalog and scores match criteria',
        'Top curated recommendations displayed on right panel with match score and budget fit',
        'User selects product and adds to cart',
        'Cart totals recalculated and verified against budget limit',
        'User proceeds to PayPal Sandbox checkout and authorizes order',
        'Backend verifies and captures payment, saving confirmed transaction with Capture ID',
      ],
    },
    {
      id: 'laptop',
      title: 'High-Ticket Technical Scenario: Programming Laptop',
      prompt: 'Find a high performance laptop for software engineering and programming under $1,200 with 16GB RAM and fast SSD.',
      budget: '$1,200.00',
      expectedFlow: [
        'Extracts processor, RAM, and SSD storage constraints',
        'Filters laptops catalog for developer-grade machines',
        'Explains trade-offs between battery life and multi-core performance',
      ],
    },
    {
      id: 'budget_block',
      title: 'Financial Safety Scenario: Budget Limit Enforcement',
      prompt: 'Find me the ultimate flagship smartphone under $2,000 with 4K display.',
      budget: '$500.00 (Default Limit)',
      expectedFlow: [
        'User finds a high-end $1,200 phone and adds it to cart',
        'System alerts in real-time that cart exceeds the $500 monthly spending cap',
        'Checkout is blocked by the backend API with an explicit 422 Budget Exceeded error',
        'Proves the AI cannot force payment without financial authorization',
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Judging Demonstration & Setup Guide</h2>
            <Badge variant="emerald" size="sm">
              PayPal Hackathon
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete walkthrough of PayPilot's autonomous shopping agent, financial guardrails, and PayPal Sandbox integration.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() =>
            navigate(
              `/ai-shopping?prompt=${encodeURIComponent(
                'PayPilot, find me wireless headphones for studying and travelling. My maximum budget is $150. Prioritize battery life and noise cancellation.'
              )}`
            )
          }
          icon={<Play className="w-3.5 h-3.5" />}
        >
          Run Judging Demo
        </Button>
      </div>

      {/* One-Click Judging Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            One-Click Test Scenarios
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {scenarios.map(sc => (
            <div
              key={sc.id}
              className="bg-white p-5 rounded-card border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{sc.title}</h4>
                  <Badge variant="blue" size="sm">
                    Budget: {sc.budget}
                  </Badge>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
                  "{sc.prompt}"
                </div>
                <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                  {sc.expectedFlow.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              <Button
                size="sm"
                onClick={() =>
                  navigate(`/ai-shopping?prompt=${encodeURIComponent(sc.prompt)}`)
                }
                icon={<Play className="w-3.5 h-3.5" />}
                className="flex-shrink-0"
              >
                Launch This Scenario
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Separation of Concerns */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Architecture: AI Intelligence vs Financial Authority
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-900 text-sm block">1. AI Agent Domain</span>
            <p className="text-slate-700 leading-relaxed">
              Google Gemini API extracts intent, queries 380+ items in database across 12 categories, compares specifications, and explains match rationale.
            </p>
            <span className="text-[11px] font-semibold text-emerald-800 block">
              Boundary: AI cannot capture payments or alter budgets.
            </span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 text-sm block">2. Backend Financial Core</span>
            <p className="text-slate-700 leading-relaxed">
              Express & SQLite recalculate cart totals, enforce spending limits in USD, manage OAuth tokens, and call PayPal Orders API v2.
            </p>
            <span className="text-[11px] font-semibold text-slate-800 block">
              Boundary: Math & rules are strictly non-negotiable.
            </span>
          </div>

          <div className="p-4 rounded-lg bg-sky-50/70 border border-sky-200 space-y-2">
            <span className="font-bold text-sky-950 text-sm block">3. PayPal Developer Platform</span>
            <p className="text-slate-700 leading-relaxed">
              Sandbox Orders v2 environment processes authorization, provides biometric/password authentication, and captures funds securely.
            </p>
            <span className="text-[11px] font-semibold text-sky-800 block">
              Boundary: Verified capture required for order settlement.
            </span>
          </div>
        </div>
      </div>

      {/* PayPal Sandbox & AI Configuration Guide */}
      <div className="bg-slate-900 text-white p-6 rounded-card border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Environment Setup & Credentials Guide
          </span>
          <Badge variant="emerald" size="sm">
            Zero Secrets in Frontend
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-slate-300">
          <div>
            <h5 className="font-bold text-emerald-400 mb-1">PayPal Sandbox Setup</h5>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Log in to <a href="https://developer.paypal.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">developer.paypal.com</a></li>
              <li>Navigate to <strong>Apps & Credentials</strong> → <strong>Sandbox</strong></li>
              <li>Create or select an App and copy your <strong>Client ID</strong> and <strong>Secret</strong></li>
              <li>Add to backend <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">.env</code>:
                <pre className="mt-1 p-2 bg-slate-950 rounded text-[11px] text-emerald-400 font-mono">
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
                </pre>
              </li>
            </ol>
          </div>

          <div>
            <h5 className="font-bold text-emerald-400 mb-1">Google Gemini API Setup</h5>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Obtain a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">aistudio.google.com</a></li>
              <li>Add to backend <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">.env</code>:
                <pre className="mt-1 p-2 bg-slate-950 rounded text-[11px] text-emerald-400 font-mono">
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash
                </pre>
              </li>
              <li>If no key is configured, PayPilot seamlessly uses its built-in local semantic NLP fallback so judges can evaluate instantly without blocking errors.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
