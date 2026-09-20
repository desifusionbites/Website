# Desi Fusion Bites - Commercial Website & Admin CMS

> **Tagline:** *"Purana Swad Naya Tadka"*  
> **Brand:** Desi Fusion Bites  
> **Proprietor:** Aruna Harlalka  
> **Contact Person:** Priya Harlalka  
> **Phone / WhatsApp:** 9051941774  
> **Email:** desifusionbites@gmail.com  
> **Address:** 275 Dwarika Jungle Road, P.O. Bhadrakali, P.S. Uttarpara, Hooghly District, West Bengal - 712232, India  
> **FSSAI Lic. No:** 12826999000591  

---

## 1. Project Overview

A production-ready commercial website and Full Admin Content Management System (CMS) for **Desi Fusion Bites**, an authentic Indian packaged-food and snack business. The platform enables the business owner to operate and update the storefront (products, variants, real photography uploads, branding, pricing, promotions, and customer enquiries) completely independently without touching source code.

### Key Capabilities
- **Traditional Indian + Modern Food Brand UI:** High-contrast, warm earthy turmeric and spice color scheme, fast mobile-responsive design, semantic HTML, and JSON-LD schema markup.
- **Strict Media Integrity:** Real owner uploads for packaging and brand photography with sleek, neutral fallback placeholders—zero fake AI imagery.
- **Full Custom Admin CMS (`/admin`):** Secure email/password login powered by Supabase Auth with server-enforced role permissions (`OWNER`, `ADMIN`, `STAFF`).
- **Product & Variant Management:** Rich catalog editor supporting multiple weights/pack sizes, ingredients, allergens, nutrition facts, draft/publish workflow, and automated WhatsApp inquiry triggers (`9051941774`).
- **B2B Wholesale Portal (`/wholesale`):** Dedicated trade lead generation capturing business name, GST/type, order volume, and geography.
- **Odoo ERP Integration Service:** Decoupled architecture for CRM lead synchronization and inventory availability. Resilient design ensures the public site stays 100% operational even if Odoo is offline.
- **Provider-Independent Shipping:** Abstracted `ShippingProvider` adapter with manual tracking support, extensible to any courier partner once finalized.

---

## 2. Technology Stack

- **Framework:** Next.js 15 (App Router, Server Actions, Dynamic SEO)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS (Custom Indian-Modern Palette) & Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Storage Buckets, Auth)
- **Validation:** Zod
- **ERP Integration:** Odoo XML-RPC / JSON-RPC Abstract Client

---

## 3. Getting Started & Local Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Start development server
npm run dev
```

The application will be running at `http://localhost:3000`.

---

## 4. Environment Variables Configuration

Configure `.env.local` with your credentials:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Public Site URL
NEXT_PUBLIC_SITE_URL=https://desifusionbites.com

# Odoo ERP Integration (Server-Side Secrets ONLY)
ODOO_ENABLED=false
ODOO_URL=https://your-company.odoo.com
ODOO_DB=desi_fusion_bites_prod
ODOO_USERNAME=api_integration_user
ODOO_API_KEY=your-odoo-api-key-or-password

# Shipping Configuration
SHIPPING_PROVIDER=manual
```

---

## 5. Supabase Database Migrations & Setup

1. Log into your Supabase Dashboard and open the **SQL Editor**.
2. Run the migration scripts in order:
   - `supabase/migrations/00001_initial_schema.sql` (Creates all tables, foreign keys, indexes, and triggers)
   - `supabase/migrations/00002_rls_policies.sql` (Applies strict Row Level Security and creates storage buckets `media`, `branding`, `products`)
   - `supabase/migrations/00003_seed_business_settings.sql` (Seeds verified business details & sections layout)

### Creating the Initial Owner Account
1. In the Supabase Dashboard, go to **Authentication -> Users** and click **Add User** (e.g. `desifusionbites@gmail.com` with a secure password).
2. Assign the `owner` role in the SQL editor:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   VALUES ('<USER_UUID_FROM_AUTH_USERS>', 'desifusionbites@gmail.com', 'Aruna Harlalka', 'owner')
   ON CONFLICT (id) DO UPDATE SET role = 'owner';
   ```
3. The owner can now sign in at `http://localhost:3000/admin/login`.

---

## 6. Business Workflows & Verification

### The Critical 21-Step Admin Test:
1. Open `/admin/login` and sign in with email/password.
2. Navigate to **Website Content -> Branding**.
3. Upload a new logo and change the tagline.
4. Verify changes are immediately reflected on the public header, hero, and footer.
5. Navigate to **Categories** and create a category (e.g., "Traditional Bites").
6. Navigate to **Products -> Add New Product**.
7. Enter product name, weight, price, and upload genuine packaging photos.
8. Click **Save as Draft** -> Confirm it is hidden from the public catalogue.
9. Click **Publish** -> Confirm it appears instantly on `/products`.
10. Click the product -> Confirm the variant pricing, ingredients, and WhatsApp CTA message format.
11. Unpublish the product -> Confirm it disappears from `/products`.

---

## 7. Production Deployment (Vercel)

1. Push code to your Git repository.
2. Import project into Vercel.
3. Configure all environment variables from `.env.example` in Vercel Project Settings.
4. Deploy! Next.js will automatically generate all static routes and dynamic endpoints.
