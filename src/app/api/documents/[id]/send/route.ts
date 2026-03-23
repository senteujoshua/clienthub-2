import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSignedUrl } from "@/lib/storage";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await db.document.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!document) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  const { client } = document;

  try {
    // ── Resolve file content ───────────────────────────────────────────────
    let attachmentContent: Buffer;

    if (document.fileUrl.startsWith("data:")) {
      // Legacy base64
      const commaIndex = document.fileUrl.indexOf(",");
      attachmentContent = Buffer.from(
        document.fileUrl.slice(commaIndex + 1),
        "base64"
      );
    } else {
      // Supabase Storage — download the file
      const signedUrl = await getSignedUrl(document.fileKey, 60);
      const res = await fetch(signedUrl);
      if (!res.ok) throw new Error("Failed to download file from storage");
      attachmentContent = Buffer.from(await res.arrayBuffer());
    }

    // ── Send email ─────────────────────────────────────────────────────────
    const transporter = createTransporter();

    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ??
        `ClientHub <${process.env.SMTP_USER}>`,
      to: client.email,
      subject: `Your Document — ${document.documentType}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1B2632;">
          <div style="background: #1B2632; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #FFB162; margin: 0; font-size: 20px;">ClientHub</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e0d8; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px;">Hello <strong>${client.name}</strong>,</p>
            <p style="margin: 0 0 16px;">Please find your <strong>${document.documentType}</strong> attached to this email.</p>
            ${
              document.expiryDate
                ? `<p style="margin: 0 0 16px; color: #888;">This document expires on <strong>${new Date(document.expiryDate).toLocaleDateString()}</strong>.</p>`
                : ""
            }
            <p style="margin: 24px 0 0; color: #888; font-size: 13px;">
              This email was sent from ClientHub. If you have any questions, please contact us.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: document.fileName,
          content: attachmentContent,
          contentType: document.mimeType,
        },
      ],
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT SEND]", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    return Response.json({ error: message }, { status: 500 });
  }
}
