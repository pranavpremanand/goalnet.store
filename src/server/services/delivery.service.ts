import { getShippingOriginPin } from "@/server/config/env";
import { ServiceUnavailableError, UpstreamError } from "@/server/errors";

export type PincodeResult = {
  pincode: string;
  serviceable: boolean;
  city?: string;
  district?: string;
  state?: string;
};

export type DeliveryQuote = PincodeResult & { shippingFee: number | null };

type JsonRecord = Record<string, unknown>;

const TARIFF_API_URL = "https://api.cept.gov.in/tariff/api/values/gettariff";
const PARCEL_LENGTH_CM = 41;
const PARCEL_BREADTH_CM = 31;
const PARCEL_HEIGHT_CM = 4;
const WEIGHT_PER_ITEM_GRAMS = 200;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function parseAmount(value: unknown) {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) return null;
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

async function fetchIndiaPostPincode(pincode: string): Promise<PincodeResult> {
  let upstream: Response;
  try {
    upstream = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error("India Post pincode lookup could not be reached", error);
    throw new UpstreamError("The pincode service could not be reached. Please try again.");
  }

  if (!upstream.ok) {
    console.error(`India Post pincode lookup failed with status ${upstream.status}`);
    throw new UpstreamError("The pincode service could not verify this PIN code. Please try again.");
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch (error) {
    console.error("India Post pincode lookup returned invalid JSON", error);
    throw new UpstreamError("The pincode service returned an invalid response. Please try again.");
  }

  if (!Array.isArray(payload) || !payload.every(isRecord)) {
    throw new UpstreamError("The pincode service returned an unexpected response. Please try again.");
  }

  const result = payload.find((entry) => readText(entry, "Status").toLowerCase() === "success");
  if (!result || !Array.isArray(result.PostOffice)) return { pincode, serviceable: false };

  const offices = result.PostOffice.filter(isRecord);
  const matchingOffices = offices.filter((office) => readText(office, "Pincode") === pincode).reverse();
  const deliveryOffice = matchingOffices.find((office) => readText(office, "DeliveryStatus").toLowerCase() === "delivery");
  const office = deliveryOffice ?? matchingOffices[0];

  return {
    pincode,
    serviceable: Boolean(deliveryOffice),
    city: office ? readText(office, "Name") : undefined,
    district: office ? readText(office, "District") : undefined,
    state: office ? readText(office, "State") : undefined,
  };
}

export async function checkPincode(pincode: string): Promise<PincodeResult> {
  return fetchIndiaPostPincode(pincode);
}

async function getTariff(pincode: string, quantity: number) {
  const sourcePin = getShippingOriginPin();
  if (!/^\d{6}$/.test(sourcePin)) {
    throw new ServiceUnavailableError("The shipping origin PIN code is not configured correctly.");
  }

  let upstream: Response;
  try {
    upstream = await fetch(TARIFF_API_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        service: "SP",
        sourcepin: sourcePin,
        destinationpin: pincode,
        weight: String(WEIGHT_PER_ITEM_GRAMS * quantity),
        length: String(PARCEL_LENGTH_CM),
        breadth: String(PARCEL_BREADTH_CM),
        height: String(PARCEL_HEIGHT_CM),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    console.error("India Post tariff service could not be reached", error);
    throw new UpstreamError("The shipping charge could not be calculated. Please try again.");
  }

  if (!upstream.ok) {
    console.error(`India Post tariff service failed with status ${upstream.status}`);
    throw new UpstreamError("The shipping charge could not be calculated. Please try again.");
  }

  let payload: unknown;
  try {
    const responseBody: unknown = await upstream.json();
    payload = typeof responseBody === "string" ? JSON.parse(responseBody) as unknown : responseBody;
  } catch (error) {
    console.error("India Post tariff service returned invalid JSON", error);
    throw new UpstreamError("The shipping service returned an invalid quote. Please try again.");
  }

  const tariffs = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.value)
      ? payload.value
      : null;
  if (!tariffs || !isRecord(tariffs[0])) {
    throw new UpstreamError("The shipping service returned an unexpected quote. Please try again.");
  }

  const tariff = tariffs[0];
  if (readText(tariff, "Validation Status").toLowerCase() !== "valid input") {
    throw new UpstreamError("The shipping service could not validate the delivery details.");
  }

  const baseTariff = parseAmount(tariff["Base Tariff"]);
  const serviceTax = parseAmount(tariff["Service Tax"]);
  if (baseTariff === null || serviceTax === null) {
    throw new UpstreamError("The shipping service returned an invalid charge.");
  }

  return baseTariff + serviceTax;
}

export async function getDeliveryQuote(pincode: string, quantity: number): Promise<DeliveryQuote> {
  const result = await fetchIndiaPostPincode(pincode);
  if (!result.serviceable) return { ...result, shippingFee: null };

  return { ...result, shippingFee: await getTariff(pincode, quantity) };
}
