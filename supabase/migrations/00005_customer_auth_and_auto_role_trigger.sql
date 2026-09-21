-- ========================================================================
-- DESI FUSION BITES - CUSTOMER AUTH & AUTOMATIC ROLE ASSIGNMENT (00005)
-- PostgreSQL / Supabase
-- ========================================================================

-- 1. Update profiles role check constraint to support 'customer'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('owner', 'admin', 'staff', 'customer'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- 2. Trigger Function: Strictly assign 'customer' to all new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'customer'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Customer Order Lookup Policy: Customers can view their own orders matching their authenticated email
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders"
    ON public.orders FOR SELECT
    USING (
        LOWER(customer_email) = LOWER(auth.jwt()->>'email')
        OR public.current_user_role() IN ('owner', 'admin', 'staff')
    );

DROP POLICY IF EXISTS "Customers can view their own order items" ON public.order_items;
CREATE POLICY "Customers can view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (
                LOWER(orders.customer_email) = LOWER(auth.jwt()->>'email')
                OR public.current_user_role() IN ('owner', 'admin', 'staff')
            )
        )
    );
