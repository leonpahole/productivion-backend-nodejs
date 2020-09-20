import { InputType, Field, ObjectType } from "type-graphql";

// ADD CAPABILITY
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

  @Field()
  canComment: boolean;

  @Field()
  canUpdateOtherComments: boolean;

  @Field()
  canDeleteOtherComments: boolean;
}

export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "VIEWER";

// ADD CAPABILITY
export type CapabilityId =
  | "canUpdateProject"
  | "canDeleteProject"
  | "canAddTask"
  | "canUpdateTask"
  | "canDeleteTask"
  | "canCompleteTask"
  | "view"
  | "canManageProjectUsers"
  | "canComment"
  | "canUpdateOtherComments"
  | "canDeleteOtherComments";

export interface ProjectCapability {
  id: number;
  capabilities: UserProjectCapabilities;
}

// ADD CAPABILITY
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
      canComment: true,
      canUpdateOtherComments: true,
      canDeleteOtherComments: true,
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
      canComment: true,
      canUpdateOtherComments: false,
      canDeleteOtherComments: false,
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
      canComment: true,
      canUpdateOtherComments: false,
      canDeleteOtherComments: false,
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
      canComment: false,
      canUpdateOtherComments: false,
      canDeleteOtherComments: false,
    },
  },
};
