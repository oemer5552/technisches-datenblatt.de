import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | undefined;

function config() {
  const endpoint = process.env.AWS_ENDPOINT_URL || process.env.S3_ENDPOINT;
  const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) throw new Error("Der private Dokumentenspeicher ist nicht vollständig konfiguriert");
  return { endpoint, bucket, accessKeyId, secretAccessKey };
}

function storage() {
  const current = config();
  if (!client) {
    client = new S3Client({
      endpoint: current.endpoint,
      region: process.env.AWS_DEFAULT_REGION || "auto",
      forcePathStyle: process.env.AWS_S3_URL_STYLE === "path",
      credentials: { accessKeyId: current.accessKeyId, secretAccessKey: current.secretAccessKey },
    });
  }
  return { client, bucket: current.bucket };
}

export async function putPrivateObject(key: string, body: Buffer, contentType: string) {
  const s3 = storage();
  await s3.client.send(new PutObjectCommand({ Bucket: s3.bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function deletePrivateObject(key: string) {
  const s3 = storage();
  await s3.client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: key }));
}

export async function getPrivateObject(key: string) {
  const s3 = storage();
  const response = await s3.client.send(new GetObjectCommand({ Bucket: s3.bucket, Key: key }));
  if (!response.Body) throw new Error("Dokument konnte nicht aus dem privaten Speicher gelesen werden");
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function signedPrivateUrl(key: string, filename: string, expiresIn = 180) {
  const s3 = storage();
  return getSignedUrl(s3.client, new GetObjectCommand({
    Bucket: s3.bucket,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename.replace(/["\r\n]/g, "-")}"`,
  }), { expiresIn });
}
