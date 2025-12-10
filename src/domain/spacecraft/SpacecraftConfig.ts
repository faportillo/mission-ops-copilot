export type SpacecraftConfig = {
  id: string;
  spacecraftId: string;
  config: unknown;
  status: string;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
};
