# PayPilot Architecture Documentation

## 1. High-Level System Overview

**PayPilot** is an autonomous AI shopping assistant that integrates natural-language requirement extraction, multi-factor product matching, financial budget guardrails, and real-time checkout through the **PayPal Developer Platform (Orders API v2)**.

```
+-----------------------------------------------------------------------------------+
|                                  USER / CLIENT                                    |
|                                                                                   |
|  +---------------------------+   +---------------------------------------------+  |
|  |     AI Shopping Chat      |   |   Live Recommendations & Cart Guardrails    |  |
|  |  (Split-Screen Copilot)   |   |   (Catalog Matching, Specs, Budget Meter)   |  |
|  +---------------------------+   +---------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                       |
                 REST API Requests (JSON / Auth Headers)
                                       v
+-----------------------------------------------------------------------------------+
|                               PAYPILOT BACKEND API                                |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  | Shopping Agent     |   | Catalog Engine        |   | Budget Enforcement     |  |
|  | (9 Tool Pipeline)  |   | (160+ Items, 10 Cats) |   | (Non-bypassable Guard) |  |
|  +--------------------+   +-----------------------+   +------------------------+  |
+-----------------------------------------------------------------------------------+
          |                               |                           |
          v                               v                           v
+-------------------+           +-------------------+       +--------------------+
|  Google Gemini    |           |    PostgreSQL /   |       |   PayPal Sandbox   |
|  2.5 Flash API    |           |  Supabase Store   |       |   Orders API v2    |
| (NLU Extraction)  |           | (Persistence RLS) |       | (Capture & Verify) |
+-------------------+           +-------------------+       +--------------------+
```

---

## 2. Core Architectural Separation of Concerns

PayPilot strictly isolates responsibilities to enforce fintech security:

| Domain | Role | Constraints & Boundaries |
| :--- | :--- | :--- |
| **AI Agent** | Understanding requirements, matching specs, explaining recommendations, Q&A on catalog items. | **CANNOT** capture payments, change budgets, bypass user approval, or hallucinate outside catalog records. |
| **Backend Core** | Mathematical cart calculations, price snapshotting, budget validation, token management. | Validates all requests via Zod. Recalculates cart totals on the server before calling PayPal. |
| **User Authority** | Explicit purchase authorization. | Inspects cart, reviews budget impact, and approves PayPal checkout popup. |
| **PayPal Platform** | Financial settlement and capture verification. | Orders API v2 (`/v2/checkout/orders` and `/v2/checkout/orders/{id}/capture`). |

---

## 3. Autonomous Shopping Agent Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React Client
    participant Backend as Express API
    participant AI as Gemini 2.5 Flash
    participant Catalog as Product Provider
    participant DB as Database Provider
    participant PayPal as PayPal Sandbox v2

    User->>Frontend: "Find wireless headphones under $150 with ANC"
    Frontend->>Backend: POST /api/ai/chat
    Backend->>AI: Tool 1: extractShoppingRequirements(prompt)
    AI-->>Backend: JSON: { category: "Headphones", budget: 150, preferences: ["ANC"] }
    Backend->>Catalog: Tool 2: searchProducts("Headphones ANC", 12)
    Catalog-->>Backend: 12 Candidate Products from 160-item Catalog
    Backend->>AI: Tool 3 & 4: rankAndRecommend(candidates)
    AI-->>Backend: Ranked Recommendations (Match scores 0-100, Budget Fit)
    Backend->>DB: Tool 5: checkBudget(userId, topProductPrice)
    DB-->>Backend: Budget Status (Allowed / Remaining)
    Backend-->>Frontend: Response { reply, recommendations, activitySteps, budgetStatus }
    Frontend-->>User: Renders split-screen recommendations & budget meter
    
    User->>Frontend: Clicks "Add to Cart" & "Proceed to Checkout"
    Frontend->>Backend: POST /api/payments/paypal/create-order
    Backend->>DB: Fetch active cart & recalculate totals from snapshots
    Backend->>DB: Verify Cart Total <= Budget Limit
    Backend->>PayPal: POST /v2/checkout/orders (Bearer token)
    PayPal-->>Backend: PayPal Order ID (e.g., 5A123456BC)
    Backend->>DB: Persist order with status: "pending"
    Backend-->>Frontend: Return PayPal Order ID
    
    Frontend->>PayPal: Open official PayPal Approval Popup
    User->>PayPal: Authorize payment in Sandbox
    PayPal-->>Frontend: onApprove(data.orderID)
    
    Frontend->>Backend: POST /api/payments/paypal/capture-order { orderId }
    Backend->>PayPal: POST /v2/checkout/orders/{id}/capture
    PayPal-->>Backend: Capture Response { id: CAP_789, status: COMPLETED }
    Backend->>DB: Verify idempotency & update order status to "completed"
    Backend-->>Frontend: Verified Confirmation { captureId, order }
    Frontend-->>User: Display Confirmed Transaction Receipt
```

---

## 4. The 9 Controlled AI Tools

1. **`extractShoppingRequirements`**: Extracts category, numeric budget, currency, and preferences via structured JSON schema.
2. **`searchProducts`**: Queries 160+ items across 10 categories with multi-term token scoring.
3. **`compareProducts`**: Builds an attribute matrix across 2-4 products with difference highlighting.
4. **`explainRecommendation`**: Explains technical specifications and match reasons strictly using catalog data.
5. **`checkBudget`**: Computes projected total expenditure and checks against the user's spending limit.
6. **`prepareCart`**: Prepares and populates cart items based on recommended selections.
7. **`getCartSummary`**: Returns hydrated cart items and calculated subtotal, shipping, and tax.
8. **`getProductDetails`**: Retrieves complete verified catalog record for any product by ID or name.
9. **`browseCatalog`**: Provides filtered, paginated catalog exploration across all 160 products.

---

## 5. Security & Threat Modeling

1. **Client Price Tampering Prevention**: The frontend never supplies unit prices to checkout. Cart totals are computed server-side using immutable database snapshots.
2. **AI Boundary Enforcement**: AI outputs are strictly recommendations; execution requires explicit user authorization and server-side budget checks.
3. **Duplicate Capture Prevention**: Idempotent capture records prevent duplicate capture calls on already-settled transactions.
4. **Secret Isolation**: PayPal Client Secret and Gemini API keys reside exclusively in server environment variables. Zero exposure in Vite client bundles.
