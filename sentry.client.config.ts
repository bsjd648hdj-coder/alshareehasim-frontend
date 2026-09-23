import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,

    beforeSend(event) {
      if (event.request?.headers) {
        const safe: Record<string, string> = {};
        const allowed = ["content-type", "user-agent", "accept"];
        for (const key of allowed) {
          if ((event.request.headers as Record<string, string>)[key])
            safe[key] = (event.request.headers as Record<string, string>)[key];
        }
        event.request.headers = safe;
      }

      if (event.request?.data) {
        let data = event.request.data;
        if (typeof data === "string") {
          try { data = JSON.parse(data); } catch { data = {}; }
        }
        if (typeof data === "object" && data !== null) {
          const sensitive = ["password", "token", "jwt", "cardNumber", "cvv", "nationalId", "pin", "otp", "secret"];
          const sanitized = { ...(data as Record<string, unknown>) };
          for (const field of sensitive) {
            if (sanitized[field] !== undefined) sanitized[field] = "[REDACTED]";
          }
          event.request.data = sanitized;
        }
      }

      return event;
    },
  });
}
