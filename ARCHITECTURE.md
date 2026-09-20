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
                   │    (Server Actions, Zod, RBAC)          │
                   └────────────┬──────────────────┬─────────┘
                                │                  │
                                ▼                  ▼
                   ┌───────────────────────┐  ┌───────────────────────┐
                   │       SUPABASE        │  │       ODOO ERP        │
                   │  - PostgreSQL + RLS   │  │  - CRM Leads          │
                   │  - Auth & Roles       │  │  - Sales & Inventory  │
                   │  - Media Storage      │  │  - Purchase (Spices)  │
                   │  - Content CMS        │  │  - Manufacturing / BOM│
                   └───────────────────────┘  └───────────┬───────────┘
                                                          │
                                                          ▼
                                              ┌───────────────────────┐
                                              │   SHIPPING PROVIDER   │
                                              │   (Manual / Future)   │
                                              └───────────────────────┘
```

---

## 1. Data Ownership & Source of Truth

To prevent redundant operational data entry and synchronization conflicts, the platform enforces strict data boundaries:

| Data Type | Primary Source of Truth | Secondary / Synced System | Purpose & Lifecycle |
|---|---|---|---|
| **Marketing Content & SEO** | **Supabase** (Website CMS) | None | Page copy, hero banners, testimonials, FAQs, visual order |
| **Product Marketing Profile** | **Supabase** (Website CMS) | None | Product names, marketing descriptions, packaging photo galleries, SEO titles |
| **Product Operational Attributes** | **Odoo ERP** | Supabase (`odoo_product_id`) | SKU, raw material BOM, unit costs, wholesale tariffs |
| **Inventory & Availability** | **Odoo ERP** (Inventory) | Supabase (`availability`) | Stock status (`in_stock`, `low_stock`, `out_of_stock`) |
| **Customer Enquiries** | **Supabase** (`enquiries`) | Odoo CRM (`crm.lead`) | Customer inquiries stored in Supabase with async sync queue to Odoo |
| **Purchasing & Production** | **Odoo ERP** | None | Raw spices, millets, packaging bags, mixing/roasting recipes |
| **Shipping & Tracking** | **Shipping Provider Adapter** | Supabase / Odoo | Tracking numbers, waybills, dispatch statuses |

---

## 2. Authentication & Server-Enforced RBAC

Authentication is handled via Supabase Auth (Email + Password) with Row Level Security (RLS) policies defined in PostgreSQL:

1. **`OWNER`**: Complete administrative authority across website settings, branding, products, variants, media, team roles, and system configuration.
2. **`ADMIN`**: Operational control over products, pricing, categories, customer inquiries, promotions, and testimonials.
3. **`STAFF`**: Restricted view permissions for handling inquiries and customer communication.
4. **Public Visitors**: Read-only access to published products, active categories, and enabled sections; write-only access to submit customer/wholesale inquiries.

---

## 3. Resilience & Failure Isolation

### Odoo Offline Protection
The public website and Admin CMS are strictly decoupled from Odoo. If the Odoo ERP instance is offline, undergoing maintenance, or unconfigured:
1. Public visitors experience zero latency or error pages.
2. Product availability defaults to safe cached/catalog states.
3. Form submissions (retail and wholesale) are saved directly in Supabase with `odoo_sync_status = 'pending'`.
4. The background synchronization logger captures errors in `integration_logs` without interrupting the user.

---

## 4. Provider-Agnostic Shipping Architecture

The shipping service utilizes an abstract interface (`ShippingProvider`):

```typescript
export interface ShippingProvider {
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;
  getRates(pincode: string, weightGrams: number): Promise<ShippingRateEstimate[]>;
  getTrackingStatus(trackingNumber: string): Promise<{ status: string; history?: unknown[] }>;
  cancelShipment(trackingNumber: string): Promise<{ success: boolean; error?: string }>;
}
```

The system ships with `ManualShippingProvider` by default. When Desi Fusion Bites finalizes a contract with a logistics carrier, an adapter implementing `ShippingProvider` is plugged into `src/lib/shipping/index.ts` without modifying the rest of the application.
