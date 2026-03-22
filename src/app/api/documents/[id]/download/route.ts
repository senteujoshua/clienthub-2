import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSignedDownloadUrl } from "@/lib/s3";

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

  try {
    const signedUrl = await getSignedDownloadUrl(document.fileKey, 300); // 5 min expiry
    return Response.json({ url: signedUrl });
  } catch (error) {
    console.error("[DOCUMENT DOWNLOAD]", error);
    return Response.json(
      { error: "Could not generate download URL" },
      { status: 500 }
    );
  }
}
