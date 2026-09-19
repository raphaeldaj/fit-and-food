const BASE_URL = "https://api.sene-pay.com";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Api-Key": process.env.SENEPAY_API_KEY!,
    "X-Api-Secret": process.env.SENEPAY_API_SECRET!,
  };
}

export type NextAction = "REDIRECT_TO_PROVIDER_LINK" | "USSD_PUSH" | "OTP_REQUIRED" | "NONE";
export type SenePayStatus = "Pending" | "Completed" | "Failed" | "Cancelled";

export interface InitiateResult {
  statut: boolean;
  message: string;
  token: string;
  redirectUrl: string | null;
  internalId: string;
  status: SenePayStatus;
  errorCode: string | null;
  failedReason: string | null;
  nextAction: NextAction;
  otpRequired: boolean;
}

export interface StatusResult {
  statut: boolean;
  token: string;
  orderId: string;
  amount: number;
  status: SenePayStatus;
  currency: string;
  totalFee: number;
  creditedAmount: number;
}

export interface CheckoutSessionResult {
  sessionToken: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
  orderReference: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export async function initiatePayment(params: {
  amount: number;
  operator: "wave" | "orange";
  customerPhone: string;
  customerName?: string;
  orderId: string;
  otpCode?: string;
}): Promise<InitiateResult> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const body = {
    amount: params.amount,
    currency: "XOF",
    country_code: "SN",
    operator: params.operator,
    customer_phone: params.customerPhone,
    customer_name: params.customerName,
    order_id: params.orderId,
    otp_code: params.otpCode,
    return_url: `${appUrl}/paiement/retour?order=${params.orderId}`,
    cancel_url: `${appUrl}/paiement/annule?order=${params.orderId}`,
    webhook_url: `${appUrl}/api/webhooks/senepay`,
    metadata: { orderId: params.orderId },
  };

  const res = await fetch(`${BASE_URL}/api/v1/payments/initiate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Erreur SenePay initiate :", { status: res.status, sent: body, received: data });
    const message = data?.message ?? data?.error ?? "Erreur lors de l'initiation du paiement.";
    const code = data?.code ?? res.status;
    throw new Error(`[SenePay ${code}] ${message}`);
  }

  return data as InitiateResult;
}

export async function getPaymentStatus(token: string): Promise<StatusResult> {
  const res = await fetch(`${BASE_URL}/api/v1/payments/${token}/status`, {
    method: "GET",
    headers: headers(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[SenePay ${data?.code ?? res.status}] ${data?.message ?? "Statut indisponible."}`);
  }
  return data as StatusResult;
}

/** Normalise un numéro sénégalais au format international attendu par SenePay. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("221")) return `+${digits}`;
  return `+221${digits}`;
}

/** Mappe la méthode stockée en base vers le code opérateur SenePay. */
export function toOperator(method: "WAVE" | "ORANGE_MONEY"): "wave" | "orange" {
  return method === "WAVE" ? "wave" : "orange";
}

export async function createCheckoutSession(params: {
  amount: number;
  orderReference: string;
}): Promise<CheckoutSessionResult> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const body = {
    amount: params.amount,
    currency: "XOF",
    orderReference: params.orderReference,
    description: "Abonnement Fit & Food",
    returnUrl: `${appUrl}/paiement/retour?order=${params.orderReference}`,
    cancelUrl: `${appUrl}/paiement/annule?order=${params.orderReference}`,
    webhookUrl: `${appUrl}/api/webhooks/senepay`,
    country: "SN",
    metadata: { orderId: params.orderReference },
  };

  const res = await fetch(`${BASE_URL}/api/v1/checkout/sessions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Erreur SenePay checkout session :", { status: res.status, sent: body, received: data });
    const message = data?.message ?? data?.error ?? "Erreur lors de la création de la session.";
    const code = data?.code ?? res.status;
    throw new Error(`[SenePay ${code}] ${message}`);
  }

  return data as CheckoutSessionResult;
}
