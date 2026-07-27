import type { Provider } from "@/providers/core/provider";

export class VercelProvider implements Provider {
  readonly id = "vercel";
  readonly name = "Vercel";
}
