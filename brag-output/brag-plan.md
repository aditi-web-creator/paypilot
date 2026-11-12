# Brag Plan: PayPilot (3-Minute Narrated Walkthrough)

> **User override note:** The user explicitly requested a **3-minute (180s)** narrated walkthrough with voiceover (`--voice`), overriding the default `/brag` 15–25s window.

## What is this app?
PayPilot is an autonomous AI shopping copilot powered by Google Gemini 2.5 Flash and PayPal Sandbox (Orders API v2) that turns natural-language shopping requests into verified catalog matches while enforcing strict server-side monthly budget guardrails.

## The angle
Most AI shopping assistants just generate chat text without verifying inventory, enforcing math, or safely executing payments. PayPilot separates AI intelligence from financial authority: Gemini handles requirement extraction and spec matching across a verified catalog, the Express backend enforces immutable price snapshots and hard budget ceilings, and PayPal Orders API v2 settles only user-authorized captures.

## Hook (first 18 seconds)
Contrast online shopping friction—tab overload and chatbots without guardrails—against PayPilot's core promise: **"Your AI. Your Budget. Your Purchase."**

## Key moments (the middle)
- Four-pillar architecture separating AI Agent Domain, Backend Enforcement, User Control, and PayPal Settlement.
- Split-Screen AI Shopping Copilot (`AiShoppingPage`): natural-language + Web Speech voice prompt (`"Find wireless headphones for studying and travelling under $150 with active noise cancellation and long battery life."`), 4 backend tool steps, and `Sony Pro Max 2026 Headphone` (`$129.99`, `98% Match`).
- Catalog Explorer (`BrowseProductsPage`) & side-by-side Comparison Matrix across price, battery life, performance, and warranty.
- Server-side Budget Guardrails (`CartPage` / `BudgetPage`): real-time Cart Total vs Limit meter and `422 Checkout Blocked: Budget Exceeded` when exceeding the `$500` monthly cap.
- Official PayPal Orders API v2 Checkout (`CheckoutPage`): server-side `create-order` and `capture-order`, zero frontend secrets, duplicate capture prevention, and verified Order/Capture ID confirmation.
- Persisted Analytics & Order History (`DashboardPage` / `OrderHistoryPage`): KPI cards, spending trend & category charts, and itemized receipts.

## Outro / punchline
Stack & verification summary (`React 18`, `TypeScript`, `Express`, `Gemini 2.5 Flash`, `PayPal Orders API v2`, `17/17 Tests Passed`), resolving to the PayPilot shield logo and tagline: **"PayPilot — Your AI. Your Budget. Your Purchase."**

## User flow worth showing
State a need in plain English or voice → AI extracts constraints & scores verified catalog products → Review cart & pass server-side budget guardrails → Authorize PayPal Sandbox checkout → Track captured receipt & spending analytics.

## Tone
- Preset: `polished`
- Creative direction: Clean fintech product walkthrough with authoritative, clear pacing
- Interpretation: Calm, high-clarity fintech minimalism (`#F8FAFC` / `#FFFFFF` / `#047857` / `#0F172A`), crisp UI recreations, steady voiceover pacing with 0.5–1.0s pauses between chapters.

## Format: landscape — 1920x1080
## Duration: 180 seconds (3:00)

## Visual identity (from the project)
- Background: `#F8FAFC` (app surface), `#FFFFFF` (cards), `#0F172A` (dark architectural bands)
- Accent: `#047857` (Primary Emerald), `#065F46` (Emerald Hover), `#ECFDF5` (Emerald Light), `#0070BA` (PayPal Blue)
- Text: `#111827` (primary), `#64748B` (secondary)
- Display font: `Inter`
- Body font: `Inter`
- Strongest visual element: PayPilot Split-Screen Copilot (AI conversation + live 98% Match card + budget meter) and Emerald Shield branding.

## Share copy (draft)
Built PayPilot: an autonomous AI shopping copilot powered by Gemini 2.5 Flash and PayPal Orders API v2 that matches verified catalog specs, blocks over-budget checkouts on the server, and settles real sandbox payments. Your AI. Your Budget. Your Purchase.

## Audio direction
- Role: Subtle, steady fintech underscore (`happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, looped cleanly across 180s) ducked under Kokoro voiceover (`af_heart`).
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady and clean, `polished` preset).
- Music treatment: Volume `0.28` during intro/outro gaps, ducked to `0.12` while voiceover is speaking, fade out over final 2.5s.
- SFX posture: Minimal, low high-frequency-risk UI cues (`interface/click_003.ogg`, `interface/drop_001.ogg`, `interface/bong_001.ogg`, `impact/impactSoft_medium_001.ogg`, `impact/impactBell_heavy_000.ogg`) at subtle volume (`0.45–0.60`).
- Restraint rule: Never let music or SFX compete with Kokoro narration clarity.

## Voiceover script

### Chapter 1 — Hook & Problem (0s–18s)
"Online shopping wasn't built for real budgets. You spend hours comparing technical specs across dozens of tabs, and chatbots just give generic replies with zero price verification or payment guardrails. Meet PayPilot: your autonomous AI shopping copilot. Your AI. Your Budget. Your Purchase."

### Chapter 2 — Architecture Overview (18s–40s)
"PayPilot separates artificial intelligence from financial authority. Google Gemini 2.5 Flash handles natural-language understanding and catalog matching. Your Express backend enforces hard mathematical totals and monthly spending ceilings. And only you authorize the final payment through PayPal Orders API v2."

### Chapter 3 — Split-Screen AI Copilot (40s–70s)
"Inside the split-screen copilot, just type or speak what you need using the built-in voice assistant. Ask for wireless headphones under 150 dollars with active noise cancellation and long battery life. PayPilot extracts your exact constraints, runs four backend tool steps across 384 catalog records, and scores a 98 percent match from verified database specs—zero hallucinations."

### Chapter 4 — Catalog & Side-by-Side Comparison (70s–92s)
"Want to explore on your own? Browse the full catalog by category, brand, rating, or currency-aware price slider. Select up to four products to open a side-by-side comparison matrix across price, battery life, performance, and warranty—all backed by strict catalog truth."

### Chapter 5 — Server-Side Budget Guardrails (92s–118s)
"Here is where PayPilot protects your wallet. In your cart, the Express server recalculates every item snapshot, shipping, and 8 percent tax. Try checking out a 1,200 dollar phone against a 500 dollar monthly limit, and the backend blocks checkout with a 422 error. The AI can never force a payment past your cap."

### Chapter 6 — PayPal Orders API v2 Checkout (118s–144s)
"When your cart fits your budget, PayPilot creates a server-side PayPal order using OAuth 2.0—keeping every client secret strictly off the frontend. You review the exact USD total and authorize via PayPal Sandbox. Once captured, the backend verifies the response, prevents duplicate captures, and issues a confirmed receipt."

### Chapter 7 — Analytics & Order History (144s–164s)
"Every verified capture updates your dashboard in real time. Track your monthly budget, total spending, and remaining runway with interactive area and category charts, or inspect itemized receipts in your filterable order history."

### Chapter 8 — Tech Stack & Outro (164s–180s)
"Built with React, TypeScript, Express, Gemini 2.5 Flash, and PayPal Orders v2—backed by 17 passing tests and zero-config local simulation. PayPilot. Your AI. Your Budget. Your Purchase."

## Storyboard (180s total, adjusted to exact WAV durations after TTS generation)
1. **Scene 1 — Hook & Problem — 18s (0s–18s):** Dark slate problem cards (`Decision Fatigue & Spec Overload` / `Impulse Overspending`) transition into PayPilot emerald shield reveal (`Your AI. Your Budget. Your Purchase.`).
2. **Scene 2 — Four-Pillar Architecture — 22s (18s–40s):** Landing Hero (`Your shopping, on autopilot.`) + 4-pillar architecture diagram (`AI Agent Domain` → `Backend Enforcement` → `User Control` → `PayPal Settlement`).
3. **Scene 3 — Split-Screen Copilot — 30s (40s–70s):** Recreated `AiShoppingPage` split-screen UI: prompt entry, extracted badges (`Headphones`, `$150`, `ANC, Battery Life`), 4 tool steps checking off, and `Sony Pro Max 2026 Headphone — $129.99 — 98% Match` card.
4. **Scene 4 — Catalog & Comparison — 22s (70s–92s):** Recreated `BrowseProductsPage` filters + multi-currency + `ComparisonModal` highlighting Price, Battery Life, Performance, and Warranty.
5. **Scene 5 — Budget Guardrails — 26s (92s–118s):** Recreated `CartPage` Order Summary (`FREE` shipping, `8%` tax) + `BudgetPage` `$500` monthly ceiling + `422 Checkout Blocked: Budget Exceeded` demonstration.
6. **Scene 6 — PayPal Orders API v2 — 26s (118s–144s):** Recreated `CheckoutPage`: `create-order` OAuth 2.0 flow → PayPal Sandbox approval → `capture-order` → `Payment Verified & Captured` receipt with Order ID & Capture ID.
7. **Scene 7 — Analytics & Receipts — 20s (144s–164s):** Recreated `DashboardPage` KPI cards + Area/Donut charts + `OrderHistoryPage` verified captures table.
8. **Scene 8 — Stack & Outro — 16s (164s–180s):** Tech stack cards + `17 Automated Tests Passed` badge → centered PayPilot logo & tagline (`Your AI. Your Budget. Your Purchase.`).
