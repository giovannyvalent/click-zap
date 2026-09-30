"use client";
import { browserDB } from "./supabase/client";
export async function uploadImage(
  file: File,
  bucket: "product-images" | "business-assets",
  prefix: string,
) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Use JPG, PNG ou WEBP.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Cada foto deve ter até 5 MB.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b
          ? resolve(b)
          : reject(new Error("Não foi possível converter a foto.")),
      "image/webp",
      0.85,
    ),
  );
  const db = browserDB();
  const path = prefix + "/" + crypto.randomUUID() + ".webp";
  const { error } = await db.storage
    .from(bucket)
    .upload(path, blob, { contentType: "image/webp", upsert: false });
  if (error) throw new Error("Falha ao enviar a imagem. Tente novamente.");
  return {
    storage_path: path,
    public_url: db.storage.from(bucket).getPublicUrl(path).data.publicUrl,
  };
}
