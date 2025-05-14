"use client";

import { sendMessage } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  pseudonym: z.string().min(2, {
    message: "Le pseudonyme doit contenir au moins 2 caractères.",
  }),
  content: z.string().min(5, {
    message: "Le message doit contenir au moins 5 caractères.",
  }),
});

export default function MessageForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pseudonym: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append("pseudonym", values.pseudonym);
      formData.append("content", values.content);

      toast.promise(sendMessage(formData), {
        loading: "Envoi en cours...",
        success: "Message envoyé avec succès!",
        error: "Erreur lors de l'envoi du message",
      });

      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Une erreur est survenue lors de l'envoi du message");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pseudonym"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pseudonyme</FormLabel>
              <FormControl>
                <Input placeholder="Votre pseudonyme" {...field} />
              </FormControl>
              <FormDescription>
                Choisissez un pseudonyme pour identifier votre message.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Partagez votre message..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Envoyer le message
        </Button>
      </form>
    </Form>
  );
}
