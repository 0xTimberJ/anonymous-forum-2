import MessageForm from "@/components/message-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <div className="p-4 container mx-auto max-w-2xl flex flex-col gap-8 lg:flex-row">
      <div>
        <h1 className="text-2xl font-bold mb-4">Forum Anonyme</h1>
        <MessageForm />
      </div>
    </div>
  );
}
