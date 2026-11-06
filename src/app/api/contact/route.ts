export async function POST() {
  return Response.json(
    { error: "Contact form submissions are temporarily unavailable." },
    { status: 503 },
  );
}
