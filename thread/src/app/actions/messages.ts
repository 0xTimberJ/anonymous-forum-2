"use server";

import { createServerEnv } from "@/config/env";

type Message = {
  id: number;
  pseudonym: string;
  content: string;
  createdAt: string;
};

function getApiUrl(): string {
  const env = createServerEnv();
  if (!env.API_URL) throw new Error("API_URL is not defined in server env");
  return env.API_URL;
}

export async function getMessages(): Promise<Message[]> {
  try {
    const res = await fetch(`${getApiUrl()}/messages`, { cache: "no-store" });
    if (!res.ok) {
      console.error("Erreur HTTP getMessages:", res.status, await res.text());
      throw new Error("Erreur lors de la récupération des messages.");
    }
    return res.json();
  } catch (error) {
    console.error("getMessages error:", error);
    return [];
  }
}
