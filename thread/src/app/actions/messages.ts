"use server";

import { createServerEnv } from "@/config/env";
import { revalidatePath } from "next/cache";

export async function getMessages() {
  try {
    const env = createServerEnv();
    const res = await fetch(`${env.API_URL}/messages`);
    if (!res.ok)
      throw new Error("Erreur lors de la récupération des messages.");
    return res.json();
  } catch (error) {
    console.error(error);
  }
}

export async function sendMessage(formData: FormData) {
  const env = createServerEnv();
  const pseudonym = formData.get("pseudonym");
  const content = formData.get("content");
  try {
    const res = await fetch(`${env.API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudonym, content }),
    });
    if (!res.ok) throw new Error("Erreur lors de l'envoi.");
    revalidatePath("/");
  } catch (error) {
    console.error(error);
  }
}
