-- ========================================================================
-- DESI FUSION BITES - ATOMIC ORDERS & DISTRIBUTED RATE LIMITING (00006)
-- ========================================================================

-- 1. Dedicated Distributed Rate Limits Table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    count int NOT NULL DEFAULT 1,
    window_start timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS: Service-role only for rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Atomic Rate Limit Check & Increment Function (Row-Locked)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key text,
    p_max_attempts int,
    p_window_seconds int
)
RETURNS boolean AS $$
DECLARE
    v_now timestamp with time zone := now();
    v_window_start timestamp with time zone;
    v_count int;
BEGIN
    SELECT window_start, count INTO v_window_start, v_count
    FROM public.rate_limits
    WHERE key = p_key
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.rate_limits (key, count, window_start, updated_at)
        VALUES (p_key, 1, v_now, v_now)
        ON CONFLICT (key) DO UPDATE
        SET count = public.rate_limits.count + 1, updated_at = v_now;
        RETURN true;
    END IF;

    -- If window has expired, reset counter and window start
    IF v_window_start < (v_now - (p_window_seconds || ' seconds')::interval) THEN
        UPDATE public.rate_limits
        SET count = 1, window_start = v_now, updated_at = v_now
        WHERE key = p_key;
        RETURN true;
    END IF;

    -- If limit exceeded, deny
    IF v_count >= p_max_attempts THEN
        RETURN false;
    END IF;

    -- Increment count
    UPDATE public.rate_limits
    SET count = count + 1, updated_at = v_now
    WHERE key = p_key;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atomic Order + Order Items Creation Function (Single PostgreSQL Transaction)
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_order jsonb,
    p_items jsonb
)
RETURNS jsonb AS $$
DECLARE
    v_order_id uuid;
    v_item jsonb;
BEGIN
    -- Insert order in an explicit atomic transaction
    INSERT INTO public.orders (
        order_number,
        user_id,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_pincode,
        shipping_country,
        customer_notes,
        subtotal_amount,
        shipping_amount,
        discount_amount,
        tax_amount,
        total_amount,
        currency,
        status,
        payment_status,
        shipping_status
    )
    VALUES (
        (p_order->>'order_number'),
        (p_order->>'user_id')::uuid,
        (p_order->>'customer_name'),
        (p_order->>'customer_phone'),
        (p_order->>'customer_email'),
        (p_order->>'shipping_address_line1'),
        (p_order->>'shipping_address_line2'),
        (p_order->>'shipping_city'),
        (p_order->>'shipping_state'),
        (p_order->>'shipping_pincode'),
        COALESCE(p_order->>'shipping_country', 'India'),
        (p_order->>'customer_notes'),
        (p_order->>'subtotal_amount')::numeric,
        COALESCE((p_order->>'shipping_amount')::numeric, 0),
        COALESCE((p_order->>'discount_amount')::numeric, 0),
        COALESCE((p_order->>'tax_amount')::numeric, 0),
        (p_order->>'total_amount')::numeric,
        COALESCE(p_order->>'currency', 'INR'),
        COALESCE(p_order->>'status', 'payment_pending'),
        COALESCE(p_order->>'payment_status', 'pending'),
        COALESCE(p_order->>'shipping_status', 'unfulfilled')
    )
    RETURNING id INTO v_order_id;

    -- Insert each item atomically
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            variant_id,
            product_name_snapshot,
            variant_title_snapshot,
            sku_snapshot,
            image_url_snapshot,
            weight_snapshot,
            unit_price,
            quantity,
            line_total
        )
        VALUES (
            v_order_id,
            NULLIF(v_item->>'product_id', '')::uuid,
            NULLIF(v_item->>'variant_id', '')::uuid,
            (v_item->>'product_name_snapshot'),
            (v_item->>'variant_title_snapshot'),
            (v_item->>'sku_snapshot'),
            (v_item->>'image_url_snapshot'),
            (v_item->>'weight_snapshot'),
            (v_item->>'unit_price')::numeric,
            (v_item->>'quantity')::int,
            (v_item->>'line_total')::numeric
        );
    END LOOP;

    RETURN jsonb_build_object('id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
