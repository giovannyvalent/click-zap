import "server-only";

const BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

async function asaas<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("Asaas não configurado.");
  const res = await fetch(BASE_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: key,
      ...init?.headers,
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data?.errors?.[0]?.description || `Falha na API do Asaas (${res.status}).`;
    throw new Error(message);
  }
  return data as T;
}

export type AsaasCustomer = { id: string };
export type AsaasSubscription = {
  id: string;
  status: string;
  nextDueDate: string;
};
export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  invoiceUrl: string;
  dueDate: string;
  paymentDate?: string | null;
  billingType: string;
};
export type AsaasPixQrCode = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function findOrCreateCustomer(input: {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
  externalReference: string;
}): Promise<AsaasCustomer> {
  const existing = await asaas<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(input.cpfCnpj)}`,
  );
  if (existing.data?.[0]) return existing.data[0];
  return asaas<AsaasCustomer>("/customers", { method: "POST", body: input });
}

export type AsaasCreditCard = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
};
export type AsaasCreditCardHolderInfo = {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
};
export async function createSubscription(input: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD";
  value: number;
  nextDueDate: string;
  description: string;
  externalReference: string;
  creditCard?: AsaasCreditCard;
  creditCardHolderInfo?: AsaasCreditCardHolderInfo;
  remoteIp?: string;
}): Promise<AsaasSubscription> {
  return asaas<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: { ...input, cycle: "MONTHLY" },
  });
}

export async function getSubscriptionFirstPayment(
  subscriptionId: string,
): Promise<AsaasPayment | null> {
  const list = await asaas<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments`,
  );
  return list.data?.[0] || null;
}

export async function getSubscriptionPayments(
  subscriptionId: string,
): Promise<AsaasPayment[]> {
  const list = await asaas<{ data: AsaasPayment[] }>(
    `/subscriptions/${subscriptionId}/payments?limit=20`,
  );
  return list.data || [];
}

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaas<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await asaas(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaas<AsaasPayment>(`/payments/${paymentId}`);
}
