import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME ?? "";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface UploadResult {
  key: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export function validateFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. File is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
    };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: PDF, JPEG, PNG, WebP, Word, Excel.`,
    };
  }
  return { valid: true };
}

export async function uploadFileToS3(
  file: File,
  clientId: string
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const key = `clients/${clientId}/documents/${uuidv4()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
      ServerSideEncryption: "AES256",
    })
  );

  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    key,
    url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  };
}

export async function deleteFileFromS3(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export const DOCUMENT_TYPES = [
  "National ID",
  "Passport",
  "Driver's License",
  "Company Registration",
  "Tax Certificate",
  "Contract",
  "Agreement",
  "Invoice",
  "Insurance Certificate",
  "Business License",
  "Financial Statement",
  "Bank Statement",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
