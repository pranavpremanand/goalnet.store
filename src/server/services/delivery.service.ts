import { getDeliveryConfig } from "@/server/config/env";
import { ServiceUnavailableError, UpstreamError } from "@/server/errors";

export type PincodeResult = {
  pincode: string;
  serviceable: boolean;
  city?: string;
  district?: string;
  state?: string;
};

type JsonRecord = Record<string, unknown>;

const STATE_NAMES: Record<string, string> = {
  AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar",
  CH: "Chandigarh", CG: "Chhattisgarh", DD: "Dadra and Nagar Haveli and Daman and Diu", DL: "Delhi", GA: "Goa",
  GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh", JK: "Jammu and Kashmir", JH: "Jharkhand",
  KA: "Karnataka", KL: "Kerala", LA: "Ladakh", LD: "Lakshadweep", MP: "Madhya Pradesh", MH: "Maharashtra",
  MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OR: "Odisha", PY: "Puducherry", PB: "Punjab",
  RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TS: "Telangana", TR: "Tripura", UP: "Uttar Pradesh",
  UK: "Uttarakhand", WB: "West Bengal",
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEnabled(value: unknown) {
  return ["y", "yes", "true", "1"].includes(String(value ?? "").toLowerCase());
}

function readText(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export async function checkPincode(pincode: string): Promise<PincodeResult> {
  const { token, baseUrl } = getDeliveryConfig();
  if (!token) throw new ServiceUnavailableError("Delivery lookup is not configured. Please contact support.");

  const endpoint = new URL("/c/api/pin-codes/json/", baseUrl);
  endpoint.searchParams.set("filter_codes", pincode);

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      headers: { Accept: "application/json", Authorization: `Token ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error("Delhivery pincode lookup could not be reached", error);
    throw new UpstreamError("The delivery service could not be reached. Please try again.");
  }

  if (!upstream.ok) {
    console.error(`Delhivery pincode lookup failed with status ${upstream.status}`);
    throw new UpstreamError("The delivery service could not verify this pincode. Please try again.");
  }

  const payload: unknown = await upstream.json();
  const deliveryCodes = isRecord(payload) && Array.isArray(payload.delivery_codes) ? payload.delivery_codes : [];
  const firstResult = deliveryCodes.find(isRecord);
  const postalCode = firstResult && isRecord(firstResult.postal_code) ? firstResult.postal_code : null;

  if (!postalCode) return { pincode, serviceable: false };

  return {
    pincode,
    serviceable: isEnabled(postalCode.pre_paid) || isEnabled(postalCode.delivery),
    city: readText(postalCode, "city"),
    district: readText(postalCode, "district"),
    state: readText(postalCode, "state") || STATE_NAMES[readText(postalCode, "state_code").toUpperCase()] || "",
  };
}
