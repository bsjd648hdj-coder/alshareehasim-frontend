import { Resend } from "resend";

// Singleton — يُنشأ مرة واحدة عند تحميل الـ module بدل instance جديدة في كل call
// هذا يُقلل object creation overhead في كل OTP send
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  const from = `${process.env.RESEND_FROM_NAME || "لمسه الثابته"} <${process.env.RESEND_FROM_EMAIL || "no-reply@alshareehasim.com"}>`;

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
}
