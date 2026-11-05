import { contactSubmissionListQuerySchema } from "@/lib/validation/contact";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler } from "@/server/http/handler";
import { listContactMessages } from "@/server/services/contact.service";

export const GET = apiHandler(async (request) => {
  await requireAdmin();
  const query = contactSubmissionListQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  return Response.json(await listContactMessages(query.cursor));
});
