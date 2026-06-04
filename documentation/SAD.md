# Software Architecture Document (SAD)

## 1. High-Level System Architecture
The Inventory Management System follows a classic **Client-Server Architecture** utilizing the **MERN Stack** (MongoDB, Express.js, React, Node.js).

```mermaid
graph TD
    User((User))
    Admin((Administrator))
    Cashier((Cashier))

    subgraph "Frontend (React + Vite)"
        UI[User Interface]
        State[Context API / Hooks]
        Router[React Router]
    end

    subgraph "Backend (Node.js + Express)"
        API[Express REST API]
        Auth[JWT Middleware]
        Controllers[Route Controllers]
        Services[Business Logic / Services]
    end

    subgraph "Database & Storage"
        DB[(MongoDB)]
        FS[Local File System / Uploads]
    end

    User --> UI
    Admin --> UI
    Cashier --> UI
    
    UI <--> API
    API <--> DB
    API <--> FS
```

## 2. Component Descriptions
- **Frontend**: A single-page application (SPA) built with React and Vite. It communicates with the backend via RESTful APIs using `fetch`.
- **Backend**: A Node.js application using Express.js to handle HTTP requests, perform business logic, and interact with the database.
- **Database**: MongoDB serves as the primary data store for products, sales, users, etc.
- **Authentication**: JWT (JSON Web Tokens) are used to secure endpoints and manage user sessions.

## 3. Data Flow Diagrams (DFD)

### Level 0: Global Data Flow
```mermaid
graph LR
    User --> |Input Data| System[Inventory System]
    System --> |Reports/Invoices| User
```

### Level 1: Sale Processing Flow
```mermaid
sequenceDiagram
    participant C as Cashier
    participant P as POS Interface (Frontend)
    participant B as Backend API
    participant D as MongoDB

    C->>P: Select Products & Add to Cart
    P->>B: POST /api/sales (Sale Data)
    B->>D: Find Product & Check Stock
    D-->>B: Stock Available
    B->>D: Save Sale Record
    B->>D: Decrement Product Inventory
    B->>D: Create Customer Invoice
    D-->>B: Success
    B-->>P: Sale Confirmation & Invoice PDF Link
    P-->>C: Display Success & Print Receipt
```
