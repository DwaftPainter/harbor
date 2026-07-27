import type { Provider } from "./provider";

export interface ProviderDeployment {
  readonly externalId: string;
  readonly projectId: string;
  readonly status: string;
}

export interface DeploymentProvider extends Provider {
  listDeployments(): Promise<ReadonlyArray<ProviderDeployment>>;
}
