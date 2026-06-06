import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 بدء تعبئة البيانات...");

  const password = await bcrypt.hash("123456", 10);

  // ===== المستخدمون =====
  const admin = await prisma.user.upsert({
    where: { email: "admin@bm.com" },
    update: {},
    create: {
      name: "مدير المنصة",
      email: "admin@bm.com",
      password,
      role: "ADMIN",
      phone: "0500000000",
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@bm.com" },
    update: {},
    create: {
      name: "أحمد المصوّر",
      email: "instructor@bm.com",
      password,
      role: "INSTRUCTOR",
      phone: "0511111111",
      bio: "مصوّر محترف بخبرة 10 سنوات في التصوير الفوتوغرافي والفيديو.",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@bm.com" },
    update: {},
    create: {
      name: "سارة الطالبة",
      email: "student@bm.com",
      password,
      role: "STUDENT",
      phone: "0522222222",
    },
  });

  // ===== الفئات =====
  const categoryData = [
    { name: "تصوير", slug: "photography", icon: "Camera" },
    { name: "فيديو", slug: "video", icon: "Video" },
    { name: "إضاءة", slug: "lighting", icon: "Lightbulb" },
    { name: "مونتاج", slug: "editing", icon: "Scissors" },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = cat.id;
  }

  // ===== الدورات =====
  const coursesData = [
    {
      title: "أساسيات التصوير الفوتوغرافي للمبتدئين",
      slug: "photography-basics",
      description:
        "دورة شاملة تأخذك من الصفر إلى الاحتراف في التصوير الفوتوغرافي. تعلّم ضبط الكاميرا، التكوين، والإضاءة الطبيعية.",
      categorySlug: "photography",
      level: "BEGINNER" as const,
      price: 299,
      isFeatured: true,
      thumbnail:
        "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800",
    },
    {
      title: "احتراف تصوير الفيديو والمونتاج",
      slug: "video-mastery",
      description:
        "تعلّم تصوير الفيديو الاحترافي وتقنيات المونتاج الحديثة لإنتاج محتوى مرئي مبهر.",
      categorySlug: "video",
      level: "INTERMEDIATE" as const,
      price: 499,
      isFeatured: true,
      thumbnail:
        "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800",
    },
    {
      title: "فن الإضاءة في الاستوديو",
      slug: "studio-lighting",
      description:
        "أتقن تقنيات الإضاءة الاستوديوية لتصوير البورتريه والمنتجات باحترافية عالية.",
      categorySlug: "lighting",
      level: "ADVANCED" as const,
      price: 399,
      isFeatured: false,
      thumbnail:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800",
    },
  ];

  let firstCourseId = "";
  let secondCourseId = "";

  for (let i = 0; i < coursesData.length; i++) {
    const c = coursesData[i];
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        categoryId: categories[c.categorySlug],
        instructorId: instructor.id,
        level: c.level,
        price: c.price,
        isPublished: true,
        isFeatured: c.isFeatured,
        thumbnail: c.thumbnail,
        sections: {
          create: [
            {
              title: "المقدمة والتأسيس",
              order: 0,
              lessons: {
                create: [
                  {
                    title: "نظرة عامة على الدورة",
                    order: 0,
                    isFree: true,
                    duration: 300,
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    description: "تعرّف على ما ستتعلّمه في هذه الدورة.",
                  },
                  {
                    title: "الأدوات والمعدات المطلوبة",
                    order: 1,
                    isFree: false,
                    duration: 600,
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  },
                ],
              },
            },
            {
              title: "المهارات الأساسية",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "الدرس العملي الأول",
                    order: 0,
                    isFree: false,
                    duration: 900,
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  },
                  {
                    title: "تطبيق ومشروع",
                    order: 1,
                    isFree: false,
                    duration: 720,
                  },
                ],
              },
            },
          ],
        },
      },
    });

    // حساب المدة
    const lessons = await prisma.lesson.findMany({
      where: { section: { courseId: course.id } },
      select: { duration: true },
    });
    const totalMin = Math.round(
      lessons.reduce((s, l) => s + (l.duration ?? 0), 0) / 60
    );
    await prisma.course.update({
      where: { id: course.id },
      data: { duration: totalMin },
    });

    if (i === 0) firstCourseId = course.id;
    if (i === 1) secondCourseId = course.id;
  }

  // ===== تسجيلات تجريبية =====
  if (firstCourseId) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: firstCourseId },
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: firstCourseId,
        status: "ACTIVE",
        enrolledAt: new Date(),
        paidAmount: 299,
        paymentMethod: "تحويل بنكي",
      },
    });
  }
  if (secondCourseId) {
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: secondCourseId },
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: secondCourseId,
        status: "PENDING",
        studentNote: "حوّلت المبلغ، أرجو التفعيل.",
      },
    });

    // إشعار للأدمن
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: "طلب تسجيل جديد",
        message: `طلب الطالب ${student.name} التسجيل في إحدى الدورات.`,
        type: "ENROLLMENT_REQUEST",
        link: "/admin/enrollments?status=PENDING",
      },
    });
  }

  console.log("✅ تمت التعبئة بنجاح!");
  console.log("الحسابات التجريبية (كلمة المرور: 123456):");
  console.log("  أدمن:  admin@bm.com");
  console.log("  مدرّب: instructor@bm.com");
  console.log("  طالب:  student@bm.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
