import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { documents } from "@/db/schema";
import { hasAdminSession } from "@/lib/auth";
import { signedPrivateUrl } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) return Response.json({ error: "Nicht autorisiert" }, { status: 401 });
  const { id } = await params; const [file] = await getDb().select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!file) return Response.json({ error: "Dokument nicht gefunden" }, { status: 404 });
  return Response.redirect(await signedPrivateUrl(file.objectKey, file.originalName), 303);
}

