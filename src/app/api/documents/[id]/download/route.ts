import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSignedUrl } from "@/lib/storage";

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

  // ── Legacy base64 documents (stored directly in fileUrl) ──────────────────
  if (document.fileUrl.startsWith("data:")) {
    const commaIndex = document.fileUrl.indexOf(",");
    if (commaIndex === -1) {
      return Response.json({ error: "File data is corrupted" }, { status: 500 });
    }
    const buffer = Buffer.from(document.fileUrl.slice(commaIndex + 1), "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  }

  // ── Supabase Storage documents — redirect to signed URL ───────────────────
  try {
    const signedUrl = await getSignedUrl(document.fileKey, 300); // 5-min URL
    return Response.redirect(signedUrl);
  } catch (error) {
    console.error("[DOCUMENT DOWNLOAD]", error);
    return Response.json({ error: "Could not generate download link" }, { status: 500 });
  }
}
