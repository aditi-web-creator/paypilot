# Hyperframes Composition Brief: PayPilot

## Objective
Create a 3-minute (180-second) narrated product walkthrough video for PayPilot using Hyperframes and Kokoro TTS (`af_heart`).

## Output
- Composition directory: `C:/projects/PayPilot/brag-output/composition/`
- Rendered video: `C:/projects/PayPilot/brag-output/brag.mp4`
- Format: landscape — 1920x1080 (30 fps)
- Duration: 180 seconds (flexed slightly if needed so all 8 voiceover clips finish cleanly before 180s)

## Source Material
- Project root: `C:/projects/PayPilot`
- Primary files read: `README.md`, `package.json`, `frontend/index.html`, `frontend/tailwind.config.js`, `frontend/src/pages/LandingPage.tsx`, `frontend/src/pages/AiShoppingPage.tsx`, `frontend/src/pages/BrowseProductsPage.tsx`, `frontend/src/pages/CartPage.tsx`, `frontend/src/pages/CheckoutPage.tsx`, `frontend/src/pages/BudgetPage.tsx`, `frontend/src/pages/DashboardPage.tsx`, `frontend/src/pages/OrderHistoryPage.tsx`, `frontend/src/pages/HelpGuidePage.tsx`
- Product name: PayPilot
- Tagline / strongest claim: "Your AI. Your Budget. Your Purchase." / "Your shopping, on autopilot."
- Key UI moments to recreate:
  1. Landing Hero + 4-Pillar Architecture Separation
  2. Split-Screen AI Shopping Copilot (`AiShoppingPage`) with 60/40 layout, extracted constraints, 4 backend activity steps, and `Sony Pro Max 2026 Headphone ($129.99, 98% Match)`
  3. Multi-facet Catalog & Comparison Matrix (`BrowseProductsPage`)
  4. Server-Side Budget Guardrails & `422 Checkout Blocked: Budget Exceeded` (`CartPage` / `BudgetPage`)
  5. PayPal Orders API v2 Checkout & `Payment Verified & Captured` receipt (`CheckoutPage`)
  6. Dashboard KPIs, Charts & Order History (`DashboardPage` / `OrderHistoryPage`)

## Visual Identity
- Background: `#F8FAFC` (app surface), `#FFFFFF` (cards), `#0F172A` (dark architectural scenes)
- Text: `#111827` (primary), `#64748B` (secondary)
- Accent: `#047857` (Primary Emerald), `#065F46` (Hover), `#ECFDF5` (Emerald Light), `#0070BA` (PayPal Blue), `#DC2626` (Error / Budget Blocked)
- Display & Body font: `Inter` (loaded via Google Fonts / system fallback)

## Audio
- Voiceover: 8 Kokoro TTS (`af_heart`) WAV clips (`assets/vo/vo-1.wav` through `assets/vo/vo-8.wav`), one per chapter, on track index 3 (`data-volume="1"`).
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (two clips or looped 180s bed), ducked to `0.12–0.14` during narration and swelling to `0.26` in intro/outro transitions, fading out over the final 2.5s.
- SFX: Low-HF-risk cues from `assets/sfx/` (`impactSoft_medium_001.ogg`, `impactBell_heavy_000.ogg`, `click_003.ogg`, `drop_001.ogg`, `bong_001.ogg`) at `0.45–0.58` volume on key reveals and button clicks.

## Requirements
- All factual claims grounded strictly in PayPilot's source files.
- High WCAG text contrast across light and dark scenes (`hyperframes check` must pass with 0 errors).
- Timeline uses GSAP `{ paused: true }` registered on `window.__timelines["root"]` and `data-start` / `data-duration` clips per Hyperframes v0.9.39 contract.
