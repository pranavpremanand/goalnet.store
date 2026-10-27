const productionEndpoint = "https://staging-express.delhivery.com/c/api/pin-codes/json";
// const productionEndpoint = "https://track.delhivery.com/c/api/pin-codes/json/";

const stateNames: Record<string, string> = {
  AN: "Andaman and Nicobar Islands",
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CH: "Chandigarh",
  CG: "Chhattisgarh",
  DD: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  GA: "Goa",
  GJ: "Gujarat",
  HP: "Himachal Pradesh",
  HR: "Haryana",
  JH: "Jharkhand",
  JK: "Jammu and Kashmir",
  KA: "Karnataka",
  KL: "Kerala",
  LA: "Ladakh",
  LD: "Lakshadweep",
  MH: "Maharashtra",
  ML: "Meghalaya",
  MN: "Manipur",
  MP: "Madhya Pradesh",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  PB: "Punjab",
  PY: "Puducherry",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TR: "Tripura",
  TS: "Telangana",
  UK: "Uttarakhand",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
};

type DataRecord = Record<string, unknown>;

function asRecord(value: unknown): DataRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as DataRecord
    : null;
}

function firstText(record: DataRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function recordsFrom(payload: unknown): DataRecord[] {
  if (Array.isArray(payload)) {
    return payload.map(asRecord).filter((record): record is DataRecord => record !== null);
  }

  const root = asRecord(payload);
  if (!root) return [];

  for (const key of ["delivery_codes", "data", "results"]) {
    const value = root[key];
    if (Array.isArray(value)) {
      return value.map(asRecord).filter((record): record is DataRecord => record !== null);
    }
  }
  return [];
}

function enabled(value: unknown) {
  return value === true || value === 1 || (typeof value === "string" && ["y", "yes", "true", "1"].includes(value.toLowerCase()));
}

export async function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin")?.trim() ?? "";
  if (!/^\d{6}$/.test(pin)) {
    return Response.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
  }

  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    return Response.json(
      { error: "Pincode lookup is not configured. Enter city and state manually." },
      { status: 503 },
    );
  }

  try {
    const url = new URL(productionEndpoint);
    url.searchParams.set("filter_codes", pin);
    const upstream = await fetch(url, {
      headers: { Authorization: `Token ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "Pincode lookup is unavailable. Enter city and state manually." },
        { status: 502 },
      );
    }

    const records = recordsFrom(await upstream.json());
    const result = records[0];
    const postalData = result ? asRecord(result.postal_code) ?? result : null;
    if (!postalData) {
      return Response.json({ error: "No delivery information was found for this pincode." }, { status: 404 });
    }

    const city = firstText(postalData, ["city", "city_name", "district", "district_name", "taluk"]);
    const rawState = firstText(postalData, ["state", "state_name", "state_code"]);
    const state = stateNames[rawState.toUpperCase()] ?? rawState;
    if (!city || !state) {
      return Response.json(
        { error: "City or state details were not returned. Enter them manually." },
        { status: 502 },
      );
    }

    const availabilityFlags = ["pre_paid", "cod", "cash", "delivery"]
      .filter((key) => key in postalData)
      .map((key) => postalData[key]);
    const serviceable = availabilityFlags.length === 0 || availabilityFlags.some(enabled);

    return Response.json({ pin, city, state, serviceable });
  } catch {
    return Response.json(
      { error: "Pincode lookup is unavailable. Enter city and state manually." },
      { status: 502 },
    );
  }
}