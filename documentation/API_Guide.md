# API Documentation (The Contract)

## 1. Authentication
All protected routes require a `Bearer` token in the `Authorization` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Authenticate user and get JWT token |
| POST | `/api/auth/register` | Register new user (Admin only) |

---

## 2. Product Management
**Base URL:** `/api/products`

### Get All Products
- **GET** `/`
- **Query Params:** `q` (search), `category`, `lowStock` (true/false)
- **Response:** `200 OK` with JSON array of products.

### Add Product
- **POST** `/` (Admin Only)
- **Payload:** `FormData` (includes image file and product details)
- **Response:** `201 Created`

### Update Product
- **PATCH** `/:id` (Admin Only)
- **Payload:** `FormData`
- **Response:** `200 OK`

---

## 3. Sales & POS
**Base URL:** `/api/sales`

### Record a Sale
- **POST** `/`
- **Payload:**
  ```json
  {
    "items": [{"productId": "...", "quantity": 2, ...}],
    "paymentMethod": "cash",
    "total": 500,
    "customerId": "..."
  }
  ```
- **Response:** `201 Created`

---

## 4. Supplier & Procurement
**Base URL:** `/api/suppliers` & `/api/purchases`

### Create Purchase (Add Stock)
- **POST** `/api/purchases`
- **Payload:**
  ```json
  {
    "supplier": "supplier_id",
    "products": [{"product": "product_id", "quantity": 10}],
    "total": 2000
  }
  ```
- **Action:** Increments product stock and creates a `SupplierInvoice`.

---

## 5. Standard Error Codes
| Code | Meaning |
| :--- | :--- |
| `200` | Success |
| `201` | Created |
| `401` | Unauthorized (Invalid Token) |
| `403` | Forbidden (Insufficient Permissions) |
| `404` | Not Found |
| `500` | Internal Server Error |
