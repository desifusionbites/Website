# Production authentication and owner setup

Use this checklist before directing customers to the production site. The database migration protects roles and order ownership, but the hosted Auth settings and secrets must also be configured.

## 1. Supabase Auth settings

Open the project at `https://supabase.com/dashboard/project/xsffgslecghktthywefe`.

In **Authentication → Providers → Email**:

1. Keep the email provider enabled.
2. Turn **Confirm email** ON. The application intentionally refuses any password signup that creates a session before email confirmation.
3. Turn **Secure email change** ON.
4. Set the minimum password length to 8 characters (Supabase Dashboard default is 6+).
5. Turn leaked-password protection ON.
6. Keep unused OAuth providers disabled.

In **Authentication → Emails / SMTP**, configure a custom production SMTP provider and test delivery. Supabase's default mail service is not intended for customer-facing production delivery.

## 2. CAPTCHA abuse protection

1. Create a Cloudflare Turnstile widget for the production and preview domains.
2. In **Authentication → Attack Protection → CAPTCHA**, select Cloudflare Turnstile and enter its secret key.
3. Add the matching public site key to every Vercel environment:

   ```text
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
   ```

The application passes the resulting token to Supabase for signup, customer/admin login, and password-recovery requests. Do not enable CAPTCHA in Supabase until this variable is present in the corresponding Vercel environment.

## 3. Allowed redirect URLs

In **Authentication → URL Configuration**, use the canonical production domain as the Site URL and allow only domains you control. At minimum:

```text
http://localhost:3000/auth/callback
https://desifusionbites.com/auth/callback
https://www.desifusionbites.com/auth/callback
https://desifusionbites.vercel.app/auth/callback
```

Add the exact current Vercel preview pattern only if previews need working authentication. Avoid broad third-party wildcard redirects.

## 4. Owner promotion

New registrations always receive the `customer` role, regardless of their email address. Owner and admin roles must never be granted by a public signup trigger.

The existing confirmed owner was preserved by the security migration. To promote a different already-verified user, first copy that user's UUID from **Authentication → Users**, then run this in the SQL editor after verifying the UUID and email are the intended person:

```sql
update public.profiles
set role = 'owner', updated_at = timezone('utc', now())
where id = 'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'
  and email = 'REPLACE_WITH_VERIFIED_EMAIL';
```

Confirm exactly one row was changed. Never promote by email alone and never auto-confirm a newly created owner account.

## 5. Vercel environment variables

Set these separately for Production, Preview, and Development as appropriate:

```text
NEXT_PUBLIC_SUPABASE_URL=https://xsffgslecghktthywefe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=the-project-publishable-key
SUPABASE_SERVICE_ROLE_KEY=the-project-service-role-key
NEXT_PUBLIC_SITE_URL=https://desifusionbites.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=the-turnstile-site-key
```

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_`, commit it, paste it into client code, or expose it in screenshots/logs. Rotate any key that may have been exposed.

After changing environment variables, redeploy and test signup verification, login, password reset, checkout, the Razorpay webhook, and an admin image upload.
