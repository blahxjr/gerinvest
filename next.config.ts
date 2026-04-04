import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: 'X-Frame-Options',          value: 'DENY' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    /**
     * 'unsafe-inline' necessário para Recharts (estilos inline) e Next.js.
     * 'unsafe-eval' necessário para Next.js HMR em dev (remover em prod se possível).
     * connect-src permite chamadas ao BRAPI e ao próprio origin.
     */
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://brapi.dev",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  webpack(config) {
    if (config.resolve?.alias) {
      config.resolve.alias['@'] = path.resolve(__dirname, 'src');
      config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    }
    return config;
  },
};

export default nextConfig;
