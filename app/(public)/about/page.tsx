import { Target, Eye, Heart, Camera } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

export const metadata = { title: "من نحن" };

export default function AboutPage() {
  return (
    <div className="container py-16">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <span className="grid mx-auto mb-6 h-16 w-16 place-items-center rounded-2xl bg-brand-gradient">
            <Camera className="h-8 w-8 text-white" />
          </span>
          <h1 className="text-3xl font-extrabold md:text-4xl">
            عن أكاديمية بيت المصوّر
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            نؤمن أن التصوير لغة بصرية يستطيع الجميع إتقانها. مهمتنا تبسيط تعلّم
            التصوير الفوتوغرافي والفيديو وجعله متاحاً لكل شغوف باللغة العربية.
          </p>
        </div>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
        {[
          {
            icon: Target,
            title: "رسالتنا",
            text: "تقديم محتوى تعليمي عملي عالي الجودة يمكّن المتعلّم من الاحتراف.",
          },
          {
            icon: Eye,
            title: "رؤيتنا",
            text: "أن نكون المرجع الأول لتعليم التصوير في العالم العربي.",
          },
          {
            icon: Heart,
            title: "قيمنا",
            text: "الجودة، الشغف، والالتزام بنجاح كل طالب في رحلته التعليمية.",
          },
        ].map((item, i) => (
          <Reveal key={item.title} delay={i * 0.1}>
            <div className="h-full rounded-2xl border border-border bg-card p-7 text-center">
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient-soft text-primary-light">
                <item.icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
