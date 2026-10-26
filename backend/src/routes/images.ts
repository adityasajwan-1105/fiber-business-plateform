import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

type CloudflareDirectUploadResponse = {
  success?: boolean;
  result?: {
    id?: string;
    uploadURL?: string;
  };
  errors?: { message?: string }[];
};

router.post("/direct-upload", requireAuth, requireAdmin, async (_req, res) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const deliveryBaseUrl = process.env.CLOUDFLARE_IMAGES_DELIVERY_BASE_URL?.replace(
    /\/+$/,
    ""
  );

  if (!accountId || !apiToken || !deliveryBaseUrl) {
    res.status(503).json({
      error: "Cloudflare Images is not configured on the server.",
    });
    return;
  }

  try {
    const deliveryBase = new URL(deliveryBaseUrl);
    if (
      deliveryBase.protocol !== "https:" ||
      deliveryBase.search ||
      deliveryBase.hash
    ) {
      res.status(500).json({
        error: "Cloudflare Images delivery URL is misconfigured.",
      });
      return;
    }
  } catch {
    res.status(500).json({
      error: "Cloudflare Images delivery URL is misconfigured.",
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.set("requireSignedURLs", "false");

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
        body: formData,
      }
    );
    const data =
      (await response.json()) as CloudflareDirectUploadResponse;

    if (
      !response.ok ||
      !data.success ||
      !data.result?.id ||
      !data.result.uploadURL
    ) {
      console.error("Cloudflare Images rejected a direct upload request.", {
        status: response.status,
        errors: data.errors?.map((error) => error.message),
      });
      res.status(502).json({
        error: "Cloudflare could not prepare an image upload.",
      });
      return;
    }

    res.json({
      id: data.result.id,
      uploadURL: data.result.uploadURL,
      deliveryURL: `${deliveryBaseUrl}/${data.result.id}/public`,
    });
  } catch (error) {
    console.error("Could not request a Cloudflare Images upload URL.", error);
    res.status(502).json({
      error: "Could not connect to Cloudflare Images.",
    });
  }
});

export default router;
