import { NextResponse } from "next/server";

/**
 * مُحدِّد معدّل بسيط في الذاكرة (نافذة ثابتة).
 * مناسب لخادم واحد (Railway). للتوسّع لأكثر من نسخة استخدم Redis/Upstash.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();
let lastSweep = Date.now();

function sweep(now: number) {
  // تنظيف دوري كل دقيقة لتفادي نمو الذاكرة
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // بالثواني
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 };
}

/** يستخرج عنوان IP للعميل من رؤوس الطلب (خلف بروكسي Railway). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** استجابة 429 موحّدة. */
export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: "عدد كبير من المحاولات، يرجى المحاولة لاحقاً" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(retryAfter, 1)) },
    }
  );
}

/**
 * يطبّق حدّ المعدّل على طلب ويعيد استجابة 429 عند التجاوز، أو null للمتابعة.
 */
export function enforceRateLimit(
  req: Request,
  opts: { name: string; limit: number; windowMs: number; extraKey?: string }
) {
  const ip = getClientIp(req);
  const key = `${opts.name}:${ip}${opts.extraKey ? `:${opts.extraKey}` : ""}`;
  const result = rateLimit(key, opts.limit, opts.windowMs);
  if (!result.ok) return tooManyRequests(result.retryAfter);
  return null;
}
