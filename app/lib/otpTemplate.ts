export function otpEmailTemplate(otp: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>رمز التحقق | لمسه الثابته</title>
</head>
<body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;direction:rtl;color:#1e293b;">
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    رمز التحقق الخاص بك هو: ${otp} (صالح لمدة 10 دقائق)
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding:32px 24px;text-align:center;">
        <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0A1C29;">لمسه الثابته</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;">بوابتك الموثوقة لشرائح الإنترنت والاتصالات</p>

        <h3 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0A1C29;">أهلاً بك معنا!</h3>
        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">يسعدنا اختيارك لـ <strong>لمسه الثابته</strong>. لضمان أمان حسابك وإتمام طلبك بنجاح، يرجى استخدام رمز التحقق التالي:</p>

        <div style="display:inline-block;padding:16px 28px;background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:8px;margin:0 0 24px;">
          <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:700;letter-spacing:8px;direction:ltr;display:inline-block;color:#0A1C29;">${otp}</span>
        </div>

        <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">هذا الرمز صالح لمدة 10 دقائق فقط.</p>
        <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">إذا لم تقم بطلب هذا الرمز، يُرجى تجاهل هذه الرسالة، فحسابك في أمان تام.</p>

        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">نسعى دائماً لتقديم أفضل باقات الإنترنت لتبقى على اتصال دائم.</p>
        <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;">شكراً لثقتك بنا!</p>

        <div style="margin:28px 0 0;padding-top:20px;border-top:1px solid #f1f5f9;font-size:12px;color:#cbd5e1;">
          فريق دعم لمسه الثابته
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
