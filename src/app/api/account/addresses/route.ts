import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { addUserAddress } from "@/server/repositories/user.repository";

export const POST = apiHandler(async (request) => {
  const user = await requireUser();
  const body = await request.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const pin = String(body?.pin ?? "").trim();
  const state = String(body?.state ?? "").trim();
  const city = String(body?.city ?? "").trim();
  const address = String(body?.address ?? "").trim();
  const apartment = String(body?.apartment ?? "").trim();

  if (!name || !email || !phone || !pin || !state || !city || !address) {
    throw new BadRequestError("All required address fields must be provided.");
  }

  const addresses = await addUserAddress(user.id, {
    name,
    email,
    phone,
    pin,
    state,
    city,
    address,
    apartment,
  });

  return Response.json({ addresses }, { status: 201 });
});

