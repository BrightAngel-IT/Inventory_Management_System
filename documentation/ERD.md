# Database Schema Blueprint (ERD)

## 1. Entity Relationship Diagram (ERD)
The system uses **MongoDB**, so these represent the logical collections and their reference-based relationships.

```mermaid
erDiagram
    USER ||--o{ SALE : "processes"
    USER {
        string _id PK
        string name
        string email
        string passwordHash
        string role
        string branch
    }

    PRODUCT {
        string _id PK
        string name
        string sku
        string barcode
        string category
        number price
        number costPrice
        number quantityInStock
        number reorderLevel
        object rack
    }

    CUSTOMER ||--o{ SALE : "makes"
    CUSTOMER ||--o{ CUSTOMER_INVOICE : "receives"
    CUSTOMER {
        string _id PK
        string name
        string phone
        string email
        number balance
    }

    SALE ||--o{ PRODUCT : "contains"
    SALE {
        string _id PK
        string invoiceNumber
        string customerName
        string paymentMethod
        number subtotal
        number total
        array items
        objectId cashierId FK
        objectId customerId FK
    }

    SUPPLIER ||--o{ PURCHASE : "supplies"
    SUPPLIER {
        string _id PK
        string name
        string contactPerson
        string phone
        string email
    }

    PURCHASE ||--o{ PRODUCT : "stocks"
    PURCHASE {
        string _id PK
        objectId supplierId FK
        number total
        date date
        array products
    }

    CUSTOMER_INVOICE ||--o{ CUSTOMER_PAYMENT : "fully/partially paid by"
    CUSTOMER_INVOICE {
        string _id PK
        string invoiceNo
        objectId customerId FK
        number totalAmount
        number balanceAmount
        string status
    }
```

## 2. Collection Schema Details

### Users (`User`)
- Management of staff and permissions.
- Roles: `admin`, `cashier`.

### Products (`Product`)
- Central stock management.
- Tracking SKUs, Barcodes, and location (`rack`).

### Sales (`Sale`)
- Transactional records.
- Stores snapshotted product data (price at time of sale) to maintain history.

### Customers (`Customer`) & Suppliers (`Supplier`)
- Entities for B2B and regular client management.
- Track outstanding balances and contact info.
