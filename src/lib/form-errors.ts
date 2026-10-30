import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api-client";

// Server-side rejections are surfaced on the matching field, or as a form-level message.
export function showApiError<Values extends FieldValues>(error: unknown, setError: UseFormSetError<Values>) {
  if (!(error instanceof ApiError)) {
    setError("root.server", { message: "Something went wrong. Please try again." });
    return;
  }
  const fieldEntries = Object.entries(error.fieldErrors ?? {}).filter(([, messages]) => messages.length > 0);
  if (error.status === 409 || error.status === 400) {
    fieldEntries.forEach(([field, messages]) => setError(field as Path<Values>, { type: "server", message: messages[0] }));
  }
  if (!fieldEntries.length) setError("root.server", { message: error.message });
}
