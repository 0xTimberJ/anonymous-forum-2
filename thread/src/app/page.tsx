import { getMessages } from "./actions/messages";

export const dynamic = "force-dynamic";

export default async function Home() {
  const messages = await getMessages();
  console.log("messages", messages);

  return (
    <div className="p-4 container mx-auto max-w-2xl flex flex-col gap-8 lg:flex-row">
      <div>
        <h1 className="text-2xl font-bold mb-4">Forum Anonyme</h1>
      </div>
      <div className="space-y-4 mt-8">
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
