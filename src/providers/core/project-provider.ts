import type { Provider } from "./provider";

export interface ProviderProject {
  readonly externalId: string;
  readonly name: string;
}

export interface ProjectProvider extends Provider {
  listProjects(): Promise<ReadonlyArray<ProviderProject>>;
}
