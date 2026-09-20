import type { NextConfig } from 'next';

const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://challenges.cloudflare.com",
            'frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com',
            'upgrade-insecure-requests',
          ].join('; '),
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: 'https',
            hostname: supabaseHostname,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
