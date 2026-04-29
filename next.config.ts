import type { NextConfig } from 'next';

// Next.js RSC + hot-reload require 'unsafe-eval' in dev only.
const isDev = process.env.NODE_ENV === 'development';

const CSP = [
  "default-src 'self'",
  // unsafe-eval needed by Next.js dev fast-refresh; removed in production
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'X-DNS-Prefetch-Control',              value: 'on' },
  { key: 'X-Frame-Options',                     value: 'DENY' },
  { key: 'X-Content-Type-Options',              value: 'nosniff' },
  { key: 'X-Permitted-Cross-Domain-Policies',   value: 'none' },
  { key: 'Referrer-Policy',                     value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',                  value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security',           value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy',             value: CSP },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Prevent body size abuse on import route (5 MB limit enforced there too)
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },

  headers: async () => [
    { source: '/(.*)', headers: SECURITY_HEADERS },
  ],
};

export default nextConfig;
