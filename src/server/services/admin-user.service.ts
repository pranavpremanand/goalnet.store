import { NotFoundError } from "@/server/errors";
import * as userRepository from "@/server/repositories/user.repository";

export async function listAdminUsers(input: { page: number; limit: number; q: string }) {
  return userRepository.listAdminUsers(input);
}

export async function setCustomerBlocked(id: string, isBlocked: boolean) {
  const user = await userRepository.setCustomerBlocked(id, isBlocked);
  if (!user) throw new NotFoundError("Customer not found.");
  return user;
}
