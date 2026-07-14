import { after } from "next/server";
import { hasAdminSession, sameOrigin } from "@/lib/auth";
import { processOrderWithAi } from "@/lib/order-ai-processing";
import { vehicleAiConfigured } from "@/lib/vehicle-ai";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request) || !(await hasAdminSession())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  if (!vehicleAiConfigured()) return Response.json({ error: "OPENAI_API_KEY ist noch nicht in Railway hinterlegt." }, { status: 503 });
  const { id } = await params;
  after(() => processOrderWithAi(id));
  return Response.json({ accepted: true }, { status: 202 });
}
