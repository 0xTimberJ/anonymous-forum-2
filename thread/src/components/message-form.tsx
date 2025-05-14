"use client";

import { sendMessage } from "@/app/actions/messages";
import { useState } from "react";

export default function MessageForm() {
  const [pseudonym, setPseudonym] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      console.log(
        "sendMessage",
        formData.get("pseudonym"),
        formData.get("content")
      );
      await sendMessage(formData);
      setMessage("Message envoyé !");
      setPseudonym("");
      setContent("");
      // Optionnel: window.location.reload() pour refetch SSR
    } catch {
      setMessage("Erreur lors de l'envoi.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div>
        <label className="block">Pseudonyme :</label>
        <input
          type="text"
          name="pseudonym"
          value={pseudonym}
          onChange={(e) => setPseudonym(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Message :</label>
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Envoyer
      </button>
      {message && <p className="mb-4">{message}</p>}
    </form>
  );
}
