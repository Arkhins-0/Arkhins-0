import 'server-only';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

/** S3-compatible bucket from AWS_* / S3_BUCKET in the environment (Neon object storage today). */
const bucket = process.env.S3_BUCKET;

export const hasStorage = Boolean(
  bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

let client: S3Client | null = null;
function s3() {
  if (!hasStorage) throw new Error('Object storage is not configured (S3_BUCKET / AWS_* env vars)');
  client ??= new S3Client({
    region: process.env.AWS_REGION || 'auto',
    endpoint: process.env.AWS_ENDPOINT_URL_S3 || undefined,
    forcePathStyle: true,
  });
  return client;
}

/** Files in the bucket are served back through /api/media/<key>, so the bucket can stay private. */
export const mediaUrl = (key: string) => `/api/media/${key.split('/').map(encodeURIComponent).join('/')}`;

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await s3().send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );
  return mediaUrl(key);
}

export async function getObject(key: string) {
  return s3().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
