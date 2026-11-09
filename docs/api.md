# PayPilot API Specification

Base URL: `http://localhost:5000/api` (Local) / `/api` (Production)

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user or demo shopper.
- **Request Body:**
  ```json
  {
    "email": "demo.shopper@paypilot.ai"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "00000000-0000-0000-0000-000000000001",
    "user": {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "demo.shopper@paypilot.ai",
      "full_name": "Alex Mercer",
      "preferred_currency": "USD"
    }
  }
  ```

### `GET /api/auth/me`
Retrieves current profile and budget configuration.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": { ... },
    "budget": {
      "budget_limit": 500.0,
      "currency": "USD"
    }
  }
  ```

---

## 2. AI Shopping Assistant Endpoints

### `POST /api/ai/chat`
Processes conversational shopping requests through the 9-tool autonomous agent.
- **Request Body:**
  ```json
  {
    "message": "Find wireless headphones under $150 with active noise cancellation and long battery life",
    "sessionId": "optional-uuid"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "4b6b6183-5ee2-4df7-9572-132d73f4e240",
      "reply": "I analyzed your request and found 4 great options...",
      "requirements": {
        "category": "Headphones",
        "budget": 150,
        "currency": "USD",
        "preferences": ["noise cancellation", "battery life"]
      },
      "recommendations": [
        {
          "product": { ... },
          "match_score": 98,
          "match_reasons": ["Matches requirement: noise cancellation"],
          "budget_fit": "well_within"
        }
      ],
      "activitySteps": [
        { "step": "understanding_requirements", "status": "completed", "label": "Extracting requirements & budget" },
        { "step": "searching_catalog", "status": "completed", "label": "Searching 160+ verified catalog products" }
      ],
      "toolCalls": [ ... ]
    }
  }
  ```

### `POST /api/ai/product-details`
Answers detailed questions about any catalog product using verified records.
- **Request Body:**
  ```json
  {
    "productId": "prod_0001",
    "question": "Does this have active noise cancellation and fast charging?"
  }
  ```

---

## 3. Product Catalog Endpoints

### `GET /api/products`
Retrieves paginated and filtered catalog records.
- **Query Parameters:**
  - `q`: Search keyword
  - `category`: Category name (e.g. `Headphones`)
  - `brand`: Brand name
  - `minPrice`, `maxPrice`: Numeric price range
  - `sort`: `price_asc`, `price_desc`, `rating_desc`, `name_asc`, `relevance`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

### `GET /api/products/categories`
Returns the 10 available catalog categories.

### `POST /api/products/compare`
Builds a side-by-side comparison matrix for 2-4 products.
- **Request Body:**
  ```json
  {
    "productIds": ["prod_0001", "prod_0002"]
  }
  ```

---

## 4. Shopping Cart Endpoints

### `GET /api/cart`
Returns active cart with subtotal, shipping, tax, and remaining budget calculation.

### `POST /api/cart/items`
Adds an item to the user's cart.
- **Request Body:**
  ```json
  {
    "productId": "prod_0001",
    "quantity": 1
  }
  ```

### `POST /api/cart/validate`
Validates cart items and verifies whether order exceeds the user's budget limit.

---

## 5. PayPal Payment Endpoints

### `POST /api/payments/paypal/create-order`
Creates an authorized order via PayPal Sandbox Orders API v2.
- **Request Body:**
  ```json
  {
    "currency": "USD"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "paypalOrderId": "5A123456BC789012D",
      "status": "CREATED",
      "amount": 140.38,
      "currency": "USD"
    }
  }
  ```

### `POST /api/payments/paypal/capture-order`
Server-side capture verification and duplicate capture prevention.
- **Request Body:**
  ```json
  {
    "orderId": "5A123456BC789012D"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "captureId": "CAP_987654321",
      "status": "COMPLETED",
      "paypalOrderId": "5A123456BC789012D",
      "amount": 140.38,
      "currency": "USD"
    }
  }
  ```

---

## 6. Budget & Analytics Endpoints

### `GET /api/budget`
Returns user's spending limit and complete expenditure summary.

### `PUT /api/budget`
Updates the monthly spending ceiling.
- **Request Body:**
  ```json
  {
    "budgetLimit": 750.0,
    "currency": "USD"
  }
  ```

### `GET /api/dashboard/summary`
Returns dashboard statistics (total spent, completed purchases, category breakdown, spending trend).
