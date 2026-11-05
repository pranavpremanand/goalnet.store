import { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
import {
  ContactSubmissionModel,
  type ContactEmailStatus,
  type ContactSubmissionAttrs,
} from "@/server/models/contact-submission.model";
import type { ContactSubmissionInput } from "@/lib/validation/contact";

export type ContactSubmissionDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  emailStatus: ContactEmailStatus;
  createdAt: string;
};

type ContactSubmissionDoc = ContactSubmissionAttrs & {
  _id: Types.ObjectId | { toString(): string };
};

export type ContactSubmissionPage = {
  submissions: ContactSubmissionDto[];
  nextCursor: string | null;
  hasMore: boolean;
};

function toDto(doc: ContactSubmissionDoc): ContactSubmissionDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    message: doc.message,
    emailStatus: doc.emailStatus,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function createContactSubmission(input: ContactSubmissionInput) {
  await connectToDatabase();
  const doc = await ContactSubmissionModel.create(input);
  return toDto(doc.toObject() as ContactSubmissionDoc);
}

export async function setContactEmailStatus(id: string, emailStatus: ContactEmailStatus) {
  await connectToDatabase();
  await ContactSubmissionModel.findByIdAndUpdate(id, { $set: { emailStatus } });
}

export async function listContactSubmissions(cursor?: string): Promise<ContactSubmissionPage> {
  await connectToDatabase();
  const filter = cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {};
  const docs = await ContactSubmissionModel.find(filter)
    .sort({ _id: -1 })
    .limit(51)
    .lean<ContactSubmissionDoc[]>();
  const hasMore = docs.length > 50;
  const page = docs.slice(0, 50);

  return {
    submissions: page.map(toDto),
    nextCursor: hasMore ? page[page.length - 1]._id.toString() : null,
    hasMore,
  };
}
