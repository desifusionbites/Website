-- ========================================================================
-- DESI FUSION BITES - E-COMMERCE ORDERS, PAYMENTS & SHIPMENTS (00004)
-- PostgreSQL / Supabase
-- ========================================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    
    -- Delivery Address
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    shipping_country TEXT NOT NULL DEFAULT 'India',
    
    -- Financial Breakdown
    subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    
    -- Status Lifecycles
    status TEXT NOT NULL DEFAULT 'payment_pending' CHECK (
        status IN (
            'payment_pending',
            'paid',
            'processing',
            'shipment_pending',
            'shipped',
            'delivered',
            'cancelled',
            'payment_failed',
            'shipping_failed'
        )
    ),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')
    ),
    shipping_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (
        shipping_status IN (
            'unfulfilled',
            'pending',
            'created',
            'pickup_scheduled',
            'in_transit',
            'out_for_delivery',
            'delivered',
            'failed',
            'cancelled'
        )
    ),
    
    -- Payment & Gateway References
    payment_method TEXT NOT NULL DEFAULT 'razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    
    -- Administrative
    customer_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);


-- 2. ORDER ITEMS TABLE (Immutable snapshot at time of purchase)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    
    -- Snapshots
    product_name_snapshot TEXT NOT NULL,
    variant_title_snapshot TEXT,
    sku_snapshot TEXT,
    image_url_snapshot TEXT,
    weight_snapshot TEXT,
    
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10, 2) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);


-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (
        status IN ('created', 'authorized', 'captured', 'failed', 'refunded')
    ),
    method TEXT,
    
    error_code TEXT,
    error_description TEXT,
    error_source TEXT,
    error_reason TEXT,
    
    raw_payload JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);


-- 4. SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    provider TEXT NOT NULL DEFAULT 'shiprocket' CHECK (provider IN ('shiprocket', 'manual')),
    shiprocket_order_id TEXT,
    shiprocket_shipment_id TEXT,
    awb_code TEXT,
    courier_name TEXT,
    courier_id TEXT,
    
    tracking_url TEXT,
    label_url TEXT,
    manifest_url TEXT,
    
    pickup_location TEXT,
    pickup_scheduled_date TIMESTAMPTZ,
    
    status TEXT NOT NULL DEFAULT 'pending',
    error_details TEXT,
    raw_response JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_awb_code ON public.shipments(awb_code);
CREATE INDEX IF NOT EXISTS idx_shipments_shiprocket_order_id ON public.shipments(shiprocket_order_id);


-- ========================================================================
-- ROW LEVEL SECURITY (RLS) FOR ORDERS, PAYMENTS, AND SHIPMENTS
-- ========================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 1. ORDERS RLS
-- Public can ONLY insert pending orders (or server actions handle creation)
DROP POLICY IF EXISTS "Public can create pending orders" ON public.orders;
CREATE POLICY "Public can create pending orders"
    ON public.orders FOR INSERT
    WITH CHECK (status = 'payment_pending');

-- Public users CANNOT freely enumerate all orders
-- Only staff/admin/owner can select all orders
DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
CREATE POLICY "Staff can view all orders"
    ON public.orders FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

-- Only Owner and Admin can update orders
DROP POLICY IF EXISTS "Only Owner and Admin can update orders" ON public.orders;
CREATE POLICY "Only Owner and Admin can update orders"
    ON public.orders FOR UPDATE
    USING (public.current_user_role() IN ('owner', 'admin'));

-- 2. ORDER ITEMS RLS
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view order items" ON public.order_items;
CREATE POLICY "Staff can view order items"
    ON public.order_items FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

-- 3. PAYMENTS RLS
-- Public cannot view payments table directly
DROP POLICY IF EXISTS "Staff can view payments" ON public.payments;
CREATE POLICY "Staff can view payments"
    ON public.payments FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

-- 4. SHIPMENTS RLS
DROP POLICY IF EXISTS "Staff can view shipments" ON public.shipments;
CREATE POLICY "Staff can view shipments"
    ON public.shipments FOR SELECT
    USING (public.current_user_role() IN ('owner', 'admin', 'staff'));

DROP POLICY IF EXISTS "Only Owner and Admin can update shipments" ON public.shipments;
CREATE POLICY "Only Owner and Admin can update shipments"
    ON public.shipments FOR UPDATE
    USING (public.current_user_role() IN ('owner', 'admin'));
