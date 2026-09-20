# Desi Fusion Bites - Supabase Authentication & Initial Owner Setup Guide

This document outlines the exact, production-ready steps to configure Supabase Authentication and establish the initial **OWNER** account for the Desi Fusion Bites Admin CMS.

---

## 1. Supabase Dashboard Configuration

### A. Authentication Providers
1. Go to your **Supabase Dashboard**: `https://supabase.com/dashboard/project/xsffgslecghktthywefe`
2. Navigate to **Authentication** → **Providers** → **Email**.
3. Ensure **Enable Email provider** is toggled **ON**.
4. Set **Confirm email** according to your preference (recommended: ON for production, or manually confirm in dashboard during initial creation).
5. Ensure **Secure email change** is **ON**.
6. Disable third-party OAuth providers (Google, GitHub, etc.) — Desi Fusion Bites Admin strictly uses Email + Password authentication.

### B. URL Configuration (Redirect URLs)
1. In Supabase Dashboard, navigate to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your primary production domain:
   ```text
   https://desifusionbites.vercel.app
   ```
3. In **Redirect URLs**, add the following URLs to allow local development, preview deployments, and production password resets / auth callbacks:
   ```text
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   http://localhost:3000/admin/reset-password
   https://desifusionbites.vercel.app/**
   https://desifusionbites.vercel.app/auth/callback
   https://desifusionbites.vercel.app/admin/reset-password
   https://*-desifusionbites.vercel.app/**
   ```

---

## 2. Initial Owner Creation Procedure

Because Supabase Auth generates a secure, unique UUID in `auth.users`, we never hardcode fake UUIDs or passwords in repository migrations.

Follow these 3 quick steps:

### Step 1: Create the User in Supabase Auth
1. In the Supabase Dashboard, navigate to **Authentication** → **Users**.
2. Click **Add user** → **Create user**.
3. Enter:
   - **Email**: `desifusionbites@gmail.com`
   - **Password**: *(Enter a strong, secure administrative password)*
   - Toggle **Auto Confirm User?** to **ON** (so email confirmation is immediately valid).
4. Click **Create user**.

---

### Step 2: Link the Auth User to `public.profiles` as `owner`
1. Navigate to **SQL Editor** in your Supabase Dashboard: `https://supabase.com/dashboard/project/xsffgslecghktthywefe/sql/new`
2. Execute the following idempotent SQL query:

```sql
-- Link desifusionbites@gmail.com to public.profiles with the 'owner' role
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    'Aruna Harlalka', 
    'owner'
FROM auth.users
WHERE email = 'desifusionbites@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
    role = 'owner',
    full_name = 'Aruna Harlalka',
    updated_at = timezone('utc'::text, now());
```

3. Verify that the record was created:
```sql
SELECT id, email, role, full_name, created_at FROM public.profiles WHERE email = 'desifusionbites@gmail.com';
```

---

## 3. Verify Admin Access

1. Visit the Admin Login portal:
   - **Local**: `http://localhost:3000/admin/login`
   - **Production**: `https://desifusionbites.vercel.app/admin/login`
2. Enter `desifusionbites@gmail.com` and the password created in Step 1.
3. Upon authentication, you will be redirected to the **Admin Dashboard** (`/admin`), where you can manage orders, products, categories, enquiries, and website settings.
4. To test logout, click **Sign Out** in the admin sidebar. You will be signed out and redirected back to `/admin/login`.
5. If you ever forget your password, click **Forgot password?** on `/admin/login` or visit `/admin/forgot-password` to receive a secure password reset link.

---

## 4. Security & Role Hierarchy

- **`owner`**: Full administrative privileges across all CMS sections, including settings, business copy, user roles, orders, and integration controls.
- **`admin`**: Product, category, order, enquiry, and promotion management.
- **`staff`**: Read-only & limited operational access as governed by Row-Level Security policies.
- **Role Escalation Protection**: Protected by database trigger `tr_protect_profile_role` — non-owners can NEVER modify roles in `public.profiles`.
