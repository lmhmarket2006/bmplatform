import "server-only";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const userName = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || "بيت المصوّر <no-reply@baitalmusawwir.com>";

export const emailEnabled = Boolean(host && userName && pass);

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!emailEnabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: userName, pass },
    });
  }
  return transporter;
}

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * يرسل بريداً إلكترونياً عبر SMTP. إن لم تُضبط مفاتيح SMTP لا يفعل شيئاً
 * (لا يرمي خطأ) كي لا يكسر تدفّق العمل في التطوير.
 */
export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const t = getTransporter();
  if (!t) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] تم تخطّي الإرسال (SMTP غير مضبوط) → ${to}: ${subject}`);
    }
    return;
  }
  try {
    await t.sendMail({ from, to, subject, html: wrapHtml(subject, html) });
  } catch (error) {
    console.error("[email] فشل الإرسال:", error);
  }
}

/** قالب HTML موحّد بهوية المنصة (RTL + داكن). */
function wrapHtml(title: string, body: string) {
  return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#0A0A0F;padding:24px;color:#F8F8FF">
    <div style="max-width:560px;margin:0 auto;background:#1A1A2E;border-radius:16px;overflow:hidden;border:1px solid #2D2D44">
      <div style="background:linear-gradient(135deg,#8B2FC9,#EC4899);padding:20px 24px">
        <h1 style="margin:0;font-size:20px;color:#fff">بيت المصوّر</h1>
      </div>
      <div style="padding:24px">
        <h2 style="margin:0 0 12px;font-size:18px;color:#F8F8FF">${title}</h2>
        <div style="font-size:14px;line-height:1.8;color:#C7C7DA">${body}</div>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #2D2D44;font-size:12px;color:#A0A0C0">
        أكاديمية بيت المصوّر — تعليم التصوير الفوتوغرافي والفيديو
      </div>
    </div>
  </div>`;
}

/** زر مرتبط بالمنصة لاستخدامه داخل نصوص البريد. */
export function emailButton(label: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;background:linear-gradient(135deg,#8B2FC9,#EC4899);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold">${label}</a>`;
}
