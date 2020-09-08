import DataLoader from "dataloader";
import { UserProjectCapabilities } from "../types/UserProjectCapabilities";
import { UserOnProject } from "../entities/UserOnProject";

export const createCapabilityLoader = () =>
  new DataLoader<
    { userId: number; projectId: number },
    UserProjectCapabilities
  >(async (keys) => {
    const projects = await UserOnProject.findByIds(keys as any[]);
    const idsToProject: Record<string, UserProjectCapabilities> = {};

    projects.forEach((p) => {
      idsToProject[`${p.userId}|${p.projectId}`] = p;
    });

    return keys.map((key) => idsToProject[`${key.userId}|${key.projectId}`]);
  });
