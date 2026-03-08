import { Storage } from "@google-cloud/storage";

const storage = new Storage();

function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error("GCS_BUCKET_NAME not configured");
  return storage.bucket(bucketName);
}

export async function uploadAvatar(
  candidateId: number,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const bucket = getBucket();
  const ext =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const fileName = `avatars/${candidateId}-${Date.now()}.${ext}`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      cacheControl: "public, max-age=31536000",
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
}

export async function uploadResume(
  identifier: string,
  buffer: Buffer
): Promise<string> {
  const bucket = getBucket();
  const fileName = `resumes/${identifier}-${Date.now()}.pdf`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    metadata: {
      contentType: "application/pdf",
      cacheControl: "private, max-age=0",
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${fileName}`;
}

export async function deleteAvatar(url: string): Promise<void> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName || !url.includes(bucketName)) return;
  const fileName = url.split(`${bucketName}/`)[1];
  if (!fileName) return;
  try {
    await getBucket().file(fileName).delete();
  } catch {
    // Ignore — file may not exist
  }
}
