import { contactSubmissionSchema } from "@/lib/validation/contact";
import { apiHandler, readJson } from "@/server/http/handler";
import { submitContactMessage } from "@/server/services/contact.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, contactSubmissionSchema);
  const result = await submitContactMessage(input);
  return Response.json(result, { status: result.emailDelivered ? 201 : 202 });
});
