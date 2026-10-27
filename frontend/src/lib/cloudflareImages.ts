import { getApiUrl, getToken } from "@/lib/auth";
const DELIVERY_BASE_URL =
  process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_BASE_URL?.replace(
    /\/+$/,
    ""
  );

type DirectUploadResponse = {
  error?: string;
  id?: string;
  uploadURL?: string;
  deliveryURL?: string;
};

type CloudflareUploadResponse = {
  success?: boolean;
  errors?: { message?: string }[];
};

export function isCloudflareImageUrl(imageUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;
  if (DELIVERY_BASE_URL) return imageUrl.startsWith(`${DELIVERY_BASE_URL}/`);

  return (
    url.hostname === "imagedelivery.net" ||
    url.hostname.endsWith(".imagedelivery.net")
  );
}

export async function uploadImageToCloudflare(image: Blob): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("Sign in as an admin before uploading images.");

  const urlResponse = await fetch(`${getApiUrl()}/images/direct-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const uploadDetails =
    (await urlResponse.json().catch(() => ({}))) as DirectUploadResponse;

  if (
    !urlResponse.ok ||
    !uploadDetails.id ||
    !uploadDetails.uploadURL ||
    !uploadDetails.deliveryURL
  ) {
    throw new Error(
      uploadDetails.error || "Could not prepare a Cloudflare image upload."
    );
  }

  const uploadUrl = new URL(uploadDetails.uploadURL);
  if (
    uploadUrl.protocol !== "https:" ||
    !uploadUrl.hostname.endsWith(".imagedelivery.net")
  ) {
    throw new Error("Cloudflare returned an invalid image upload URL.");
  }

  const formData = new FormData();
  formData.append("file", image, "image.webp");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });
  const uploadResult =
    (await uploadResponse.json().catch(() => ({}))) as CloudflareUploadResponse;

  if (!uploadResponse.ok || !uploadResult.success) {
    throw new Error(
      uploadResult.errors?.[0]?.message ||
        "Cloudflare could not store the selected image."
    );
  }

  return uploadDetails.deliveryURL;
}

export function compressImage(
  file: Blob,
  maxDimension = 1600
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load the selected image."));
    };
    image.onload = () => {
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.width, image.height)
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not process the selected image."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Could not process the selected image."));
            return;
          }
          resolve({ blob, width: canvas.width, height: canvas.height });
        },
        "image/webp",
        0.8
      );
    };
    image.src = objectUrl;
  });
}
