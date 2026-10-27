import { request } from "./auth";
import type { Product } from "@/data/products";
import { defaultLandingContent, type LandingContent } from "./landingContent";

export async function fetchPublicProducts(): Promise<Product[]> {
  const data = await request<{ products: Product[] }>("/products");
  return data.products || [];
}

export async function createAdminProduct(
  product: Omit<Product, "id">
): Promise<Product> {
  const data = await request<{ product: Product }>("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
  return data.product;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await request<{ message: string; id: string }>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function fetchPublicLandingContent(): Promise<LandingContent> {
  const data = await request<{ content: LandingContent }>("/landing");
  return {
    ...defaultLandingContent,
    ...(data.content || {}),
  };
}

export async function updateAdminLandingContent(
  content: Partial<LandingContent>
): Promise<LandingContent> {
  const data = await request<{ content: LandingContent }>("/landing", {
    method: "PUT",
    body: JSON.stringify(content),
  });
  return {
    ...defaultLandingContent,
    ...(data.content || {}),
  };
}
