# Desi Fusion Bites - Architecture & System Design

```
                   ┌─────────────────────────────────────────┐
                   │             PUBLIC WEBSITE              │
                   │  (Next.js 15 App Router + Tailwind CSS) │
                   └────────────────────┬────────────────────┘
                                        │
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │           APPLICATION LAYER             │
                   │  (Server Actions, Zod, RBAC, Cart/Ord)  │
                   └───────┬────────────┬────────────┬───────┘
                           │            │            │
                           ▼            ▼            ▼
                   ┌──────────────┐┌───────────┐┌──────────────┐
                   │   SUPABASE   ││ RAZORPAY  ││  SHIPROCKET  │
                   │  - Postgres  ││ - Orders  ││ - Adhoc Ord  │
                   │  - Auth/RLS  ││ - Webhooks││ - AWB/Track  │
                   │  - Orders/CMS││ - Prepaid ││ - Logistics  │
                   └──────────────┘└───────────┘└──────────────┘
```

---

## 1. End-to-End E-Commerce Checkout Lifecycle

```
Customer
   ↓
Cart & Delivery Details (/checkout)
   ↓
createCheckoutSessionAction (Server Action)
   ├─ Server-Authoritative Price Recalculation (Supabase DB)
   ├─ Insert Internal Order (status: 'payment_pending')
   ├─ Insert Immutable order_items Snapshots
   └─ Initialize Razorpay Order (POST /v1/orders)
   ↓
Razorpay Modal (UPI, Cards, NetBanking)
   ↓
Customer Authorizes Payment
   ↓
verifyPaymentAction (Server Action) / Razorpay Webhook
   ├─ Timing-Safe HMAC-SHA256 Signature Verification
   ├─ Mark Internal Order PAID (status: 'paid', payment_status: 'paid')
   ├─ Store Payment Record in payments table
   └─ Trigger Shiprocket Shipment Creation (POST /v1/external/orders/create/adhoc)
   ↓
Shiprocket Logistics
   ├─ AWB Generation & Courier Partner Assignment
   └─ Real-Time Tracking Link Saved in shipments table
   ↓
Customer Order Confirmation (/order-confirmation/[orderNumber])
   └─ Tracking via /track-order (Phone-Authenticated)
```

---

## 2. Security & Data Integrity Principles

1. **Prepaid Only (No COD)**: All online orders must be verified through Razorpay before fulfillment.
2. **Server-Side Price Authority**: Client cart prices are never trusted. All totals, item prices, and variant options are validated against live database records on checkout submission.
3. **Immutable Snapshots**: `order_items` stores historical snapshots (name, SKU, weight, unit price) so future price or catalog edits never alter existing invoices.
4. **Anti-Enumeration RLS**: Public users cannot list or enumerate orders. Public order tracking requires exact Order Number + matching 10-digit mobile number.
5. **Decoupled Failure Isolation**:
   - If Shiprocket is unavailable or unconfigured, the order remains `PAID`.
   - The failure is captured in `integration_logs`, and staff can retry shipment creation via the Admin CMS with one click.
   - Webhook processing is idempotent to prevent duplicate shipments from duplicate webhook deliveries.

---

## 3. Data Ownership & Source of Truth

| Data Domain | Primary Source of Truth | Secondary / Synced System | Purpose & Lifecycle |
|---|---|---|---|
| **Orders & Invoices** | **Supabase** (`orders`, `order_items`) | Shiprocket (for delivery) | Customer orders, line items, addresses, payment status |
| **Payment Gateway** | **Razorpay** (API / Webhooks) | Supabase (`payments`) | Captured transactions, transaction IDs, payment methods |
| **Logistics & Delivery** | **Shiprocket** (`shipments`) | Supabase (`shipments`) | AWBs, couriers, live tracking, dispatch statuses |
| **Marketing Catalog** | **Supabase** (`products`, `categories`) | None | Customer catalog, images, descriptions, pack sizes |
| **Team Authentication** | **Supabase Auth & Profiles** | None | Owner, Admin, and Staff role-based access control |
| **Odoo ERP** | Dormant (`ODOO_ENABLED=false`) | None | ERP architecture preserved for future integration |

---

## 4. Shipping Provider Abstraction

The system implements the universal `ShippingProvider` interface:

```typescript
export interface ShippingProvider {
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;
  getRates(pincode: string, weightGrams: number): Promise<ShippingRateEstimate[]>;
  getTrackingStatus(trackingNumber: string): Promise<{ status: string; history?: unknown[] }>;
  cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }>;
}
```

Implementations:
- `ManualShippingProvider`: Fallback manual waybill tracking.
- `ShiprocketProvider`: Full Shiprocket REST API integration with token caching, custom adhoc order creation, and live AWB tracking.

