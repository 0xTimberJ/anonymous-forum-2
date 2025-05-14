"use server";

import { createServerEnv } from "@/config/env";
import { revalidatePath } from "next/cache";

function getApiUrl(): string {
  const env = createServerEnv();
  if (!env.API_URL) throw new Error("API_URL is not defined in server env");
  return env.API_URL;
}

export async function sendMessage(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const pseudonym = formData.get("pseudonym")?.toString().trim();
  const content = formData.get("content")?.toString().trim();

  if (!pseudonym || !content) {
    return { ok: false, error: "Pseudonyme et message requis." };
  }

  try {
    const res = await fetch(`${getApiUrl()}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudonym, content }),
    });
    if (!res.ok) {
      const msg = await res.text();
      console.error("Erreur HTTP sendMessage:", res.status, msg);
      return { ok: false, error: "Erreur lors de l'envoi." };
    }
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    console.error("sendMessage error:", error);
    return { ok: false, error: "Erreur réseau lors de l'envoi." };
  }
}
