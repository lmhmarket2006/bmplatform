import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  CreditCard,
  PlayCircle,
  Camera,
  Video,
  Lightbulb,
  Scissors,
  Star,
  Users,
  BookOpen,
  Clapperboard,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { CourseCard } from "@/components/courses/course-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getFeaturedCourses,
  getCategories,
  getInstructors,
  getPublicStats,
} from "@/lib/data";
import { formatNumber, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const categoryIcons: Record<string, typeof Camera> = {
  تصوير: Camera,
  فيديو: Video,
  إضاءة: Lightbulb,
  مونتاج: Scissors,
};

export default async function HomePage() {
  const [courses, categories, instructors, stats] = await Promise.all([
    getFeaturedCourses(),
    getCategories(),
    getInstructors(),
    getPublicStats(),
  ]);

  const statItems = [
    { label: "طالب وطالبة", value: stats.students, icon: Users },
    { label: "دورة تدريبية", value: stats.courses, icon: BookOpen },
    { label: "درس تعليمي", value: stats.lessons, icon: Clapperboard },
    { label: "مدرّب محترف", value: stats.instructors, icon: GraduationCap },
  ];

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(139,47,201,0.25),transparent_45%),radial-gradient(circle_at_10%_60%,rgba(236,72,153,0.18),transparent_40%)]" />
        <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent-light" />
                أكاديمية التصوير الأولى عربياً
              </span>
              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                أتقن فن{" "}
                <span className="text-gradient">التصوير الاحترافي</span> خطوة
                بخطوة
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                دورات عملية في التصوير الفوتوغرافي والفيديو والإضاءة والمونتاج،
                مع متابعة من مدربين خبراء وشهادات معتمدة عند الإتمام.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="gradient" size="lg">
                  <Link href="/courses">
                    تصفّح الدورات
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register">انضم مجاناً</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-brand-gradient-soft glow-primary">
                <div className="grid h-full place-items-center">
                  <Camera className="h-28 w-28 text-primary-light/50" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient">
                    <PlayCircle className="h-6 w-6 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">تعلّم بالممارسة</p>
                    <p className="text-xs text-muted-foreground">
                      مشاريع عملية حقيقية
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Stats Bar ===== */}
      <section className="border-y border-border bg-surface">
        <div className="container grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {statItems.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient-soft">
                  <stat.icon className="h-6 w-6 text-primary-light" />
                </span>
                <span className="text-3xl font-extrabold">
                  {formatNumber(stat.value)}+
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Featured Courses ===== */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="دوراتنا"
          title="أبرز الدورات التدريبية"
          subtitle="اختر من بين أفضل الدورات المصمّمة بعناية لتطوير مهاراتك"
        />
        {courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <Reveal key={course.id} delay={i * 0.05}>
                <CourseCard course={course} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyHint text="لا توجد دورات مميّزة بعد — سيتم عرضها هنا قريباً." />
        )}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/courses">عرض كل الدورات</Link>
          </Button>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="border-y border-border bg-surface py-20">
        <div className="container">
          <SectionHeading
            eyebrow="كيف تبدأ؟"
            title="ثلاث خطوات بسيطة للتعلّم"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "١. سجّل حسابك",
                text: "أنشئ حسابك المجاني في دقيقة واحدة وابدأ رحلتك.",
              },
              {
                icon: CreditCard,
                title: "٢. اشترك في الدورة",
                text: "اختر دورتك وأرسل طلب التسجيل، وسيتم تفعيله لك بسرعة.",
              },
              {
                icon: PlayCircle,
                title: "٣. ابدأ التعلّم",
                text: "شاهد الدروس، طبّق المشاريع، واحصل على شهادتك.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                  <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient">
                    <step.icon className="h-7 w-7 text-white" />
                  </span>
                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="container py-20">
        <SectionHeading eyebrow="المجالات" title="تصفّح حسب التخصص" />
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((cat, i) => {
              const Icon = categoryIcons[cat.name] ?? Camera;
              return (
                <Reveal key={cat.id} delay={i * 0.05}>
                  <Link
                    href={`/courses?category=${cat.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-7 text-center transition-all hover:border-primary/50 hover:bg-brand-gradient-soft"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient-soft text-primary-light transition-transform group-hover:scale-110">
                      <Icon className="h-7 w-7" />
                    </span>
                    <span className="font-bold">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat._count.courses} دورة
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <EmptyHint text="سيتم إضافة التخصصات قريباً." />
        )}
      </section>

      {/* ===== Instructors ===== */}
      {instructors.length > 0 && (
        <section className="border-y border-border bg-surface py-20">
          <div className="container">
            <SectionHeading eyebrow="فريقنا" title="نخبة من المدربين" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {instructors.map((ins, i) => (
                <Reveal key={ins.id} delay={i * 0.05}>
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-7 text-center">
                    <Avatar className="h-20 w-20 text-xl">
                      <AvatarFallback>{getInitials(ins.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{ins.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ins._count.instructorCourses} دورة
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Testimonials ===== */}
      <section className="container py-20">
        <SectionHeading eyebrow="آراؤهم" title="ماذا قال طلابنا؟" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "سارة العتيبي",
              text: "أفضل أكاديمية تصوير التحقت بها، المحتوى عملي والمدربون متعاونون جداً.",
            },
            {
              name: "خالد المطيري",
              text: "تعلّمت المونتاج من الصفر للاحتراف، الشرح واضح ومنظّم بشكل رائع.",
            },
            {
              name: "نورة القحطاني",
              text: "الدورات غيّرت مستواي في التصوير تماماً، أنصح بها كل مبتدئ.",
            },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <div className="mb-4 flex gap-1 text-accent-light">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  “{t.text}”
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(t.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{t.name}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="container pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-center md:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-white">
              <h2 className="text-3xl font-extrabold md:text-4xl">
                جاهز لبدء رحلتك في التصوير؟
              </h2>
              <p className="text-white/85">
                انضم لآلاف الطلاب وابدأ التعلّم اليوم. حسابك المجاني بانتظارك.
              </p>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/register">أنشئ حسابك الآن</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal>
      <div className="mb-10 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary-light">
          {eyebrow}
        </span>
        <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">{title}</h2>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
      {text}
    </div>
  );
}
