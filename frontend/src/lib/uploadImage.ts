import { getApiUrl, getToken } from "@/lib/auth";
import { compressImage, uploadImageToCloudflare } from "@/lib/cloudflareImages";

export async function uploadAdminImage(file: File): Promise<string> {
  const { blob } = await compressImage(file);
  const token = getToken();
  if (!token) {
    throw new Error("Sign in as an admin before uploading images.");
  }

  try {
    return await uploadImageToCloudflare(blob);
  } catch {
    const formData = new FormData();
    formData.append("file", blob, file.name.replace(/\.[^.]+$/, ".webp") || "image.webp");

    const response = await fetch(`${getApiUrl()}/images/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Could not upload the image.");
    }
    return data.url;
  }
}
