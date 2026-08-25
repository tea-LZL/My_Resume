export interface Project {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly repositoryUrl: string;
  readonly repositoryLabel: string;
  readonly coverImageUrl: string;
  readonly gallery?: readonly string[];
  readonly featured: boolean;
}