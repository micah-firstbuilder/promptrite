export const runtime = "nodejs";

// Webhooks disabled by request. Keeping route to avoid 404 if configured.
// Respond 200 no-op.
export async function POST() {
  return Response.json({ ok: true, message: "Webhooks disabled" });
}
