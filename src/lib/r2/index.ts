import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { env } from "@/config/env-config"

// forcePathStyle: exigido pelo MinIO (dev) e recomendado pelo próprio R2 (evita
// depender de DNS por-bucket) — mesmo client fala com os dois, só troca env var.
const client = new S3Client({
  endpoint: env.R2_ENDPOINT,
  region: "auto",
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.R2_SECRET_ACCESS_KEY ?? "",
  },
})

export function r2Client() {
  async function putObject(key: string, body: Buffer, contentType: string) {
    await client.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }))
    return publicUrl(key)
  }

  async function deleteObject(key: string) {
    await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }))
  }

  function publicUrl(key: string) {
    return `${env.R2_PUBLIC_URL}/${key}`
  }

  return { putObject, deleteObject, publicUrl }
}
