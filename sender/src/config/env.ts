import * as z from "zod";

export const createServerEnv = () => {
  const ServerEnvSchema = z.object({
    API_URL: z.string(),
  });

  const serverEnvVars = {
    API_URL: process.env.API_URL,
  };

  const parsedServerEnv = ServerEnvSchema.safeParse(serverEnvVars);

  if (!parsedServerEnv.success) {
    throw new Error(
      `Invalid server env provided.
      The following variables are missing or invalid:
      ${Object.entries(parsedServerEnv.error.flatten().fieldErrors)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")}
  `
    );
  }

  return parsedServerEnv.data ?? {};
};
