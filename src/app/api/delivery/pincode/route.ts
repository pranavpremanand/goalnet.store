type JsonRecord = Record<string, unknown>;

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

export async function GET(request: Request) {
  const pincode = new URL(request.url).searchParams.get("pincode")?.trim() ?? "";

  if (!/^\d{6}$/.test(pincode)) {
    return Response.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
  }

  const token = process.env.DELHIVERY_API_TOKEN?.trim();
  if (!token) {
    return Response.json(
      { error: "Delivery lookup is not configured. Please contact support." },
      { status: 503 },
    );
  }

  const endpoint = new URL("https://staging-express.delhivery.com/c/api/pin-codes/json/");
  endpoint.searchParams.set("filter_codes", pincode);

  try {
    const upstream = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "The delivery service could not verify this pincode. Please try again." },
        { status: 502 },
      );
    }

    const payload: unknown = await upstream.json();
    const deliveryCodes = isRecord(payload) && Array.isArray(payload.delivery_codes)
      ? payload.delivery_codes
      : [];
    const firstResult = deliveryCodes.find(isRecord);
    const postalCode = firstResult && isRecord(firstResult.postal_code)
      ? firstResult.postal_code
      : null;

    if (!postalCode) {
      return Response.json({ pincode, serviceable: false });
    }

    const serviceable = isEnabled(postalCode.pre_paid) || isEnabled(postalCode.delivery);
    return Response.json({
      pincode,
      serviceable,
      city: readText(postalCode, "city"),
      district: readText(postalCode, "district"),
      state: readText(postalCode, "state"),
    });
  } catch {
    return Response.json(
      { error: "The delivery service could not be reached. Please try again." },
      { status: 502 },
    );
  }
}