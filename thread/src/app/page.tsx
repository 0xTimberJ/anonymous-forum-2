"use client";

// Component to fetch and send messages to the API
import { useEffect, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [pseudonym, setPseudonym] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  // Fetch messages on mount and refresh
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        cache: "no-store",
      });
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();
  }, []);

  // Handle form submission to send a new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudonym, content }),
    });
    if (res.ok) {
      setMessage("Message envoyé !");
      setPseudonym("");
      setContent("");
      // Refresh messages
      const updatedRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { cache: "no-store" }
      );
      const updatedMessages = await updatedRes.json();
      setMessages(updatedMessages);
    } else {
      setMessage("Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Forum Anonyme</h1>

      {/* Form to send messages */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block">Pseudonyme :</label>
          <input
            type="text"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block">Message :</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Envoyer
        </button>
      </form>
      {message && <p className="mb-4">{message}</p>}

      {/* Display messages */}
      <div className="space-y-4">
        {messages.map(
          (msg: {
            id: number;
            pseudonym: string;
            content: string;
            createdAt: string;
          }) => (
            <div key={msg.id} className="border p-4 rounded">
              <p className="font-semibold">
                {msg.pseudonym} - {new Date(msg.createdAt).toLocaleString()}
              </p>
              <p>{msg.content}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
