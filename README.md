# 🎓 بيت المصوّر — منصة تعليم التصوير الفوتوغرافي والفيديو

منصة تعليمية متكاملة احترافية تحتوي على موقع تسويقي + ثلاث لوحات تحكم منفصلة (مدير / مدرّب / طالب)، مع نظام **تفعيل تسجيل يدوي** (بدون بوابة دفع).

الهوية البصرية: بنفسجي `#8B2FC9` + فوشيا `#EC4899` على خلفية داكنة `#0A0A0F` — واجهة عربية بالكامل (RTL) ووضع داكن.

---

## 🛠️ التقنيات

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + مكوّنات بنمط **shadcn/ui** + **Framer Motion**
- **React Hook Form** + **Zod** + **TanStack Query** + **Zustand**
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js v5** (Credentials) + **bcryptjs**
- **Cloudinary** (رفع الفيديو/الصور المباشر) + **Nodemailer** (بريد SMTP)
- **dnd-kit** (سحب وإفلات) + **next-themes** (وضع داكن/فاتح)
- **Lucide React** + **date-fns** + **Sonner** (إشعارات)

---

## 🚀 التشغيل محلياً

### 1. المتطلبات

- Node.js 18+ و قاعدة بيانات PostgreSQL

### 2. الإعداد

```bash
npm install
cp .env.example .env   # ثم عدّل القيم
```

عدّل `DATABASE_URL` و `AUTH_SECRET` في ملف `.env`. لتوليد مفتاح:

```bash
npx auth secret
```

### 3. قاعدة البيانات والبيانات التجريبية

```bash
npm run db:push     # إنشاء الجداول
npm run db:seed     # بيانات تجريبية + حسابات
```

### 4. التشغيل

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 👤 الحسابات التجريبية (كلمة المرور: `123456`)

| الدور | البريد |
|------|--------|
| مدير | `admin@bm.com` |
| مدرّب | `instructor@bm.com` |
| طالب | `student@bm.com` |

---

## ☁️ النشر على Railway (مع PostgreSQL المدمج)

1. **أنشئ مشروعاً** على [railway.app](https://railway.app) واربط مستودع GitHub.
2. **أضف قاعدة بيانات**: داخل المشروع اضغط **New → Database → Add PostgreSQL**. سيُنشئ Railway متغير `DATABASE_URL` تلقائياً.
3. **اربط المتغير بالخدمة**: في خدمة الويب أضف المتغيرات التالية:

   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   AUTH_SECRET=<مفتاح عشوائي قوي>
   AUTH_URL=https://<your-app>.up.railway.app
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_PAYMENT_BANK_NAME=مصرف الراجحي
   NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME=أكاديمية بيت المصوّر
   NEXT_PUBLIC_PAYMENT_IBAN=SAxxxxxxxxxxxxxxxxxxxxxx

   # رفع الوسائط (اختياري — بدونها يعمل لصق الروابط يدوياً)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<unsigned-preset>

   # البريد الإلكتروني (اختياري — بدونها تعمل الإشعارات داخل المنصة فقط)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<بريدك>
   SMTP_PASS=<App Password>
   SMTP_FROM=بيت المصوّر <no-reply@yourdomain.com>
   ```

   > `${{Postgres.DATABASE_URL}}` هو مرجع متغيّر Railway — اضبطه عبر زر **Add Reference**.

4. **البناء والنشر**: ملف `railway.json` مهيّأ مسبقاً:
   - أمر البناء: `npm run build`
   - أمر التشغيل: `npm run railway:start` (يطبّق سكيمة قاعدة البيانات تلقائياً عبر `prisma db push` ثم يشغّل التطبيق).
5. **(اختياري) البيانات التجريبية** بعد أول نشر — عبر Railway CLI:

   ```bash
   railway run npm run db:seed
   ```

   أو شغّل `npm run db:seed` محلياً مع ضبط `DATABASE_URL` على رابط Railway العام.

> ملاحظة: لا تنسَ أن يكون `AUTH_URL` مطابقاً لدومين التطبيق على Railway، وإلا ستفشل المصادقة.

### 🔁 النشر التلقائي من GitHub

لجعل Railway يبني وينشر تلقائياً عند كل `git push`:

1. ادفع الكود إلى GitHub: `git push origin main`.
2. في Railway افتح **خدمة الويب → Settings → Source**.
3. اضغط **Connect Repo** واختر مستودع `bmplatform` والفرع `main`.
4. فعّل **Automatic Deployments** (مفعّلة افتراضياً بعد الربط).
5. (اختياري) في **Settings → Build** اضبط **Watch Paths** أو **Root Directory** إن لزم.

بعد الربط، كل دفعة على `main` ستُطلق بناءً ونشراً جديداً تلقائياً.

---

## ☁️ إعداد Cloudinary للرفع المباشر

1. أنشئ حساباً مجانياً على [cloudinary.com](https://cloudinary.com).
2. من **Settings → Upload → Upload presets** أنشئ preset بنوع **Signing Mode = Unsigned**.
3. ضع `Cloud name` واسم الـ preset في المتغيرات `NEXT_PUBLIC_CLOUDINARY_*`.
4. الآن أزرار «ارفع صورة/فيديو» في النماذج ترفع مباشرة من المتصفح إلى Cloudinary.

> بدون المفاتيح يظهر حقل لصق الرابط فقط — لا شيء يتعطّل.

---

## ✨ أبرز الميزات

- **التفعيل اليدوي**: الطالب يرسل طلب تسجيل مع إيصال التحويل → الأدمن يراجع ويفعّل بضغطة زر → إشعار للطالب.
- **لوحة الأدمن**: إحصائيات، إدارة الطلاب والمدربين والدورات (نشر/تمييز/حذف)، تقارير + تصدير CSV.
- **لوحة المدرب**: إنشاء الدورات، منشئ المنهج (أقسام + دروس) مع **سحب وإفلات** لإعادة الترتيب، نشر الدورة، متابعة تقدّم الطلاب.
- **لوحة الطالب**: متابعة من حيث توقّف، مشغّل دروس (MP4/YouTube مع سرعات تشغيل)، شهادات قابلة للطباعة (PDF).
- **رفع مباشر** للفيديو والصور عبر Cloudinary (دورات، دروس، إيصالات، صور شخصية).
- **إشعارات بريد إلكتروني** عند طلب التسجيل والتفعيل وإضافة درس وإكمال الدورة (Nodemailer).
- **استعادة كلمة المرور** عبر رابط بريد آمن صالح لساعة.
- **وضع داكن/فاتح** قابل للتبديل + **نظام إشعارات** داخل المنصة + حماية المسارات حسب الدور عبر `middleware`.

---

## 📁 هيكل المشروع

```
app/
  (public)/    الموقع التسويقي + الدورات
  (auth)/      تسجيل الدخول / حساب جديد
  admin/       لوحة المدير
  instructor/  لوحة المدرّب
  student/     لوحة الطالب
  api/         مسارات الـ API
components/     مكوّنات الواجهة (ui / layout / dashboard / courses ...)
lib/           prisma, auth, validations, helpers
prisma/        schema.prisma + seed.ts
middleware.ts  حماية المسارات حسب الدور
```

---

*بيت المصوّر — منصة تعليم التصوير الاحترافية*
