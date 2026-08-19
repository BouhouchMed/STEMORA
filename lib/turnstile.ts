const TURNSTILE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
};

function getTurnstileSecretKey() {
  return process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "";
}

function getClientIp(request: Request) {
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  if (cloudflareIp) return cloudflareIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim();
}

export function getTurnstileEnvStatus() {
  return {
    hasSiteKey: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    hasSecretKey: Boolean(getTurnstileSecretKey())
  };
}

export async function verifyTurnstileToken(token: unknown, request: Request) {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    return {
      ok: false,
      status: 500,
      message: "Configuration Captcha manquante. إعدادات الكابتشا ناقصة."
    };
  }

  if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
    return {
      ok: false,
      status: 400,
      message: "Veuillez valider le Captcha. المرجو تأكيد الكابتشا."
    };
  }

  try {
    const response = await fetch(TURNSTILE_SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: getClientIp(request),
        idempotency_key: crypto.randomUUID()
      })
    });

    const result = (await response.json()) as TurnstileVerifyResponse;

    if (!response.ok || !result.success) {
      return {
        ok: false,
        status: 400,
        message: "Captcha invalide ou expiré. الكابتشا غير صحيحة أو انتهت صلاحيتها.",
        errorCodes: result["error-codes"] || []
      };
    }

    return { ok: true, status: 200 };
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return {
      ok: false,
      status: 500,
      message: "Impossible de vérifier le Captcha. تعذر التحقق من الكابتشا."
    };
  }
}
