import { GitHubService } from "./github";
import { RepositoryService } from "./repositories";
import type { RepositoryUpsertInput } from "@/types/repository";

export interface SyncResult {
  total: number;
  repositories: RepositoryUpsertInput[];
}

export async function syncAllRepositories(): Promise<SyncResult> {
  const githubService = new GitHubService();
  const repositoryService = new RepositoryService();
  const githubRepositories = await githubService.listPublicRepositories();
  const repositories: RepositoryUpsertInput[] = [];

  for (const githubRepository of githubRepositories) {
    repositories.push(await githubService.toRepositoryRecord(githubRepository));
  }

  const total = await repositoryService.upsertMany(repositories);

  return {
    total,
    repositories,
  };
}

export async function syncRepositoryByName(
  repositoryName: string,
): Promise<RepositoryUpsertInput> {
  const githubService = new GitHubService();
  const repositoryService = new RepositoryService();
  const githubRepository = await githubService.getRepository(repositoryName);
  const repository = await githubService.toRepositoryRecord(githubRepository);

  await repositoryService.upsert(repository);

  return repository;
}
