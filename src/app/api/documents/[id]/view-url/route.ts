import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSignedUrl } from "@/lib/storage";

/**
 * Returns a short-lived URL for viewing a document in the browser.
 * For legacy base64 documents, returns the data URL directly.
 * For Supabase-stored documents, returns a 1-hour signed URL.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const document = await db.document.findUnique({ where: { id } });

  if (!document) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  // Legacy base64 — return as-is
  if (document.fileUrl.startsWith("data:")) {
    return Response.json({ url: document.fileUrl, isDataUrl: true });
  }

  // Supabase Storage — generate signed URL valid for 1 hour
  try {
    const url = await getSignedUrl(document.fileKey, 3600);
    return Response.json({ url, isDataUrl: false });
  } catch (error) {
    console.error("[VIEW URL]", error);
    return Response.json({ error: "Could not generate view URL" }, { status: 500 });
  }
}
