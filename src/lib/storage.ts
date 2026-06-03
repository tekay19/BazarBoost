import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

/**
 * S3-compatible storage (AWS S3 / Cloudflare R2 / MinIO).
 * Falls back to a local data-URL passthrough when not configured, so the MVP
 * still runs without object storage.
 */
const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION || "auto";
const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.S3_PUBLIC_URL;

export const storageConfigured = Boolean(bucket && accessKeyId && secretAccessKey);

let client: S3Client | null = null;
function getClient() {
  if (!client) {
    client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: Boolean(endpoint), // needed for MinIO
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });
  }
  return client;
}

export async function uploadFile(
  body: Buffer,
  contentType: string,
  prefix = "uploads"
): Promise<{ key: string; url: string }> {
  const ext = contentType.split("/")[1]?.replace("+xml", "") || "bin";
  const key = `${prefix}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

  if (!storageConfigured) {
    // dev fallback: inline data URL
    return { key, url: `data:${contentType};base64,${body.toString("base64")}` };
  }

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const url = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
    : `${endpoint?.replace(/\/$/, "")}/${bucket}/${key}`;
  return { key, url };
}

// allowlist of safe upload mime types
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
export const ALLOWED_IMPORT_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
