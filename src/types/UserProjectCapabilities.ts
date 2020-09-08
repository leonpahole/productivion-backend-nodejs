import { InputType, Field, ObjectType } from "type-graphql";

@InputType("UserProjectCapabilitiesInput")
@ObjectType("UserProjectCapabilitiesType")
export class UserProjectCapabilities {
  @Field()
  canUpdateProject: boolean;

  @Field()
  canDeleteProject: boolean;

  @Field()
  canAddTask: boolean;

  @Field()
  canUpdateTask: boolean;

  @Field()
  canDeleteTask: boolean;

  @Field()
  canCompleteTask: boolean;

  @Field()
  canManageProjectUsers: boolean;
}

export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "VIEWER";

export type CapabilityId =
  | "canUpdateProject"
  | "canDeleteProject"
  | "canAddTask"
  | "canUpdateTask"
  | "canDeleteTask"
  | "canCompleteTask"
  | "view"
  | "canManageProjectUsers";

export interface ProjectCapability {
  id: number;
  capabilities: UserProjectCapabilities;
}

export const RolePreset: Record<Role, ProjectCapability> = {
  ADMIN: {
    id: 1,
    capabilities: {
      canUpdateProject: true,
      canDeleteProject: true,
      canAddTask: true,
      canUpdateTask: true,
      canDeleteTask: true,
      canCompleteTask: true,
      canManageProjectUsers: true,
    },
  },
  PROJECT_MANAGER: {
    id: 2,
    capabilities: {
      canUpdateProject: true,
      canDeleteProject: false,
      canAddTask: true,
      canUpdateTask: true,
      canDeleteTask: true,
      canCompleteTask: true,
      canManageProjectUsers: false,
    },
  },
  DEVELOPER: {
    id: 3,
    capabilities: {
      canUpdateProject: false,
      canDeleteProject: false,
      canAddTask: false,
      canUpdateTask: true,
      canDeleteTask: false,
      canCompleteTask: true,
      canManageProjectUsers: false,
    },
  },
  VIEWER: {
    id: 4,
    capabilities: {
      canUpdateProject: false,
      canDeleteProject: false,
      canAddTask: false,
      canUpdateTask: false,
      canDeleteTask: false,
      canCompleteTask: false,
      canManageProjectUsers: false,
    },
  },
};
