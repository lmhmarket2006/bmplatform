/** @type {import('next').NextConfig} */

// سياسة أمان المحتوى (CSP) — مضبوطة لتسمح بـ Cloudinary و YouTube والخطوط
const csp = [
  "default-src 'self'",
  // Next.js يحتاج inline scripts؛ نسمح بها مع self
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  // صور المدربين قد تكون من أي مصدر https + Cloudinary + data/blob للمعاينة
  "img-src 'self' data: blob: https:",
  // فيديوهات Cloudinary/MP4 خارجية
  "media-src 'self' blob: https:",
  // تضمين يوتيوب/فيميو في مشغّل الدروس
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  // رفع Cloudinary + استدعاءات الـ API
  "connect-src 'self' https://api.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
