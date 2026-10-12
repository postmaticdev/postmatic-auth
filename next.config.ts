import type { NextConfig } from "next";

// Halaman login/verify/undangan tidak boleh di-frame (clickjacking), dan URL
// berisi token ([token] routes) tidak boleh bocor lewat Referer ke domain lain. Tidak memasang
// CSP script-src penuh karena Next.js memakai inline script dan Turnstile.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Lintas origin hanya origin yang dikirim (path berisi token tidak bocor);
  // tidak memakai no-referrer agar validasi hostname Turnstile tetap jalan.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
