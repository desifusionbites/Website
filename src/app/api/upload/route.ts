import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireRole } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireRole(['owner', 'admin']);

    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase storage is unconfigured in environment variables.' },
        { status: 500 }
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'products';

    if (!['products', 'branding'].includes(bucket)) {
      return NextResponse.json({ error: 'Invalid upload destination bucket' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate mime type (JPG, PNG, WEBP, GIF only; SVG disallowed for public storage security)
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type (${file.type}). Only JPG, PNG, WEBP, and GIF are allowed.` },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try upload with user client first
    let uploadResult = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    // If bucket doesn't exist or RLS policy restricts, try admin client if configured
    if (uploadResult.error) {
      try {
        const adminClient = createAdminClient();
        // Ensure bucket exists
        await adminClient.storage.createBucket(bucket, { public: true }).catch(() => {});
        uploadResult = await adminClient.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });
      } catch {
        // Continue with original error if admin client fails
      }
    }

    if (uploadResult.error) {
      return NextResponse.json(
        { error: `Upload error: ${uploadResult.error.message || 'Storage permission denied'}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, fileName: safeFileName });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Upload failed';
    const status = errorMsg.toLowerCase().includes('unauthorized') ? 401 : errorMsg.toLowerCase().includes('forbidden') ? 403 : 500;
    return NextResponse.json(
      { error: errorMsg },
      { status }
    );
  }
}
