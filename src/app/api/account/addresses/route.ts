import { apiHandler, readJson } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { addUserAddress } from "@/server/repositories/user.repository";
import { addressSchema, MAX_SAVED_ADDRESSES } from "@/lib/validation/account";

export const GET = apiHandler(async () => {
  const user = await requireUser();
  return Response.json({ addresses: user.addresses });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser();
  const address = await readJson(request, addressSchema);
  const duplicateAddress = user.addresses.find((saved) =>
    saved.name === address.name &&
    saved.email === address.email &&
    saved.phone === address.phone &&
    saved.pin === address.pin &&
    saved.state === address.state &&
    saved.city === address.city &&
    saved.address === address.address &&
    saved.apartment === address.apartment
  );
  if (!duplicateAddress && user.addresses.length >= MAX_SAVED_ADDRESSES) {
    throw new BadRequestError(`You can save up to ${MAX_SAVED_ADDRESSES} addresses.`);
  }

  const addresses = duplicateAddress
    ? user.addresses
    : await addUserAddress(user.id, address);
  const savedAddressId = duplicateAddress?.id ?? addresses?.[addresses.length - 1]?.id;

  return Response.json({ addresses, savedAddressId }, { status: 201 });
});
