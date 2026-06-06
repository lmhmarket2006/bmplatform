import Link from "next/link";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { Reveal } from "@/components/shared/reveal";
import { getPublishedCourses, getCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const [courses, categories] = await Promise.all([
    getPublishedCourses({
      categorySlug: searchParams.category,
      search: searchParams.search,
    }),
    getCategories(),
  ]);

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          جميع الدورات التدريبية
        </h1>
        <p className="mt-3 text-muted-foreground">
          اكتشف دوراتنا في التصوير الفوتوغرافي والفيديو والإضاءة والمونتاج
        </p>
      </div>

      {/* بحث */}
      <form className="mx-auto mb-8 flex max-w-xl gap-2" action="/courses">
        {searchParams.category && (
          <input type="hidden" name="category" value={searchParams.category} />
        )}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="ابحث عن دورة..."
            className="h-11 w-full rounded-lg border border-border bg-surface pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </form>

      {/* فلاتر الفئات */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <FilterChip
          href="/courses"
          active={!searchParams.category}
          label="الكل"
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            href={`/courses?category=${cat.slug}`}
            active={searchParams.category === cat.slug}
            label={cat.name}
          />
        ))}
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <Reveal key={course.id} delay={i * 0.04}>
              <CourseCard course={course} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
          لا توجد دورات مطابقة لبحثك حالياً.
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-brand-gradient text-white"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
