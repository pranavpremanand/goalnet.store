import { unstable_rethrow } from "next/navigation";
import { z, type ZodType } from "zod";
import { AppError, BadRequestError } from "@/server/errors";

type RouteHandler<Context> = (request: Request, context: Context) => Promise<Response>;

function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    const fieldErrors = z.flattenError(error).fieldErrors as Record<string, string[]>;
    return Response.json({ error: error.issues[0]?.message ?? "Invalid request.", fieldErrors }, { status: 400 });
  }

  if (error instanceof AppError) {
    return Response.json({ error: error.message, fieldErrors: error.fieldErrors }, { status: error.status });
  }

  // Next uses thrown errors internally (e.g. to bail out of prerendering); those must not become 500s.
  unstable_rethrow(error);
  console.error("Unhandled API error", error);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

// Route handlers stay thin: parse input, call a service, return a Response. Errors are mapped here.
export function apiHandler<Context = unknown>(handler: RouteHandler<Context>) {
  return async (request: Request, context: Context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

// Requiring JSON also blocks cross-site form posts, which cannot set this content type.
export async function readJson<Schema extends ZodType>(request: Request, schema: Schema): Promise<z.output<Schema>> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new AppError(415, "Requests must be sent as application/json.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BadRequestError("The request body is not valid JSON.");
  }

  return schema.parse(body);
}
