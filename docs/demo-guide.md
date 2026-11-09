# PayPilot Hackathon Judging & Demonstration Guide

This guide walks through the exact demonstration workflow specified in **Section 17** of the Master Prompt.

---

## 1. Quick Start for Judges

To run the full stack locally:

```bash
# 1. Install all dependencies across monorepo
npm run install:all

# 2. Run backend test suite (17 passed integration tests)
npm test

# 3. Start both backend and frontend concurrently
npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## 2. Hackathon Judging Demonstration Scenario

### Step 1: Open the Application
Navigate to `http://localhost:5173` (or click **"Launch AI Assistant"** on the Landing Page).
Notice the persistent fintech sidebar and clean emerald minimalism design.

### Step 2: Submit Natural-Language Prompt
In the **AI Shopping Assistant** (`/ai-shopping`), enter:
> *"PayPilot, find me wireless headphones for studying and travelling. My maximum budget is $150. Prioritize battery life and noise cancellation."*

### Step 3: Observe Backend-Driven Agent Operations
Watch the live execution activity steps in the assistant bubble:
- `understanding_requirements`: Extracted category `Headphones`, budget `$150.00`, preferences `noise cancellation`, `battery life`.
- `searching_catalog`: Scored candidate items across 160 products in catalog.
- `comparing_products`: Technical specifications comparison.
- `evaluating_budget`: Verified compatibility with your authorized spending limit.

### Step 4: Inspect Curated Recommendations on Right Panel
The right panel displays scored recommendation cards:
- **Match Score** (e.g., 98% Match)
- **Budget Fit** (Well Within Budget)
- **Verified Specs**: Hybrid ANC, 30-40 hour battery life, USB-C fast charging.

### Step 5: Test Product Q&A & Browse Catalog
1. Click **"View Details"** or ask in chat:
   > *"What is the warranty and battery life on the Sony Pro Max 2026 Headphone?"*
2. Notice the AI answers strictly using catalog facts and never hallucinates unverified details.
3. Open **Browse Products** (`/browse`) in the sidebar to verify all 160 items across 10 categories can be explored freely with multi-facet filters.

### Step 6: Add to Cart & Validate Budget
1. Click **"Add to Cart"** on the recommended headphone card.
2. Open **Shopping Cart** (`/cart`).
3. Observe recalculated subtotal, free shipping over $50, and 8% tax calculated on the server.
4. Verify remaining runway after purchase.

### Step 7: Authorize PayPal Sandbox Checkout
1. Click **"Proceed to PayPal Checkout"** (`/checkout`).
2. The backend generates a PayPal Orders API v2 order.
3. Click the official **PayPal button** (or click the **"Simulate Verified Sandbox Approval"** button for instant one-click verification).
4. The backend verifies the capture response server-side.
5. The order confirmation receipt displays:
   - Verified Order ID
   - Server Capture ID
   - Itemized Snapshot

### Step 8: Verify Dashboard & Order History Persistence
1. Navigate to **Overview** (`/dashboard`):
   - Total spending is updated with real dollars.
   - Completed order count increases.
   - Recharts timeline and category donut reflect real database records.
2. Navigate to **My Orders** (`/orders`):
   - Review verified receipt and status badge (`COMPLETED`).

### Step 9: Test Budget Enforcement Guardrail
1. Navigate to **Settings** (`/settings`) or **Budget** (`/budget`).
2. Set budget limit to a small value, e.g., **$30.00**.
3. Attempt to checkout with an item costing $129.99.
4. Observe the system immediately blocks checkout with an explicit **"Budget Exceeded"** message.
5. Proves the AI cannot force payment without user budget authorization.
