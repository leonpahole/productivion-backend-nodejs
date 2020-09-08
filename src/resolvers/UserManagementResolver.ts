import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  FieldResolver,
  Root,
} from "type-graphql";
import { User } from "../entities/User";
import { createUserOnProject, UserOnProject } from "../entities/UserOnProject";
import { isAuth } from "../middleware/isAuth";
import { AppContext } from "../types/AppContext";
import {
  UserProjectCapabilities,
  RolePreset,
  Role,
} from "../types/UserProjectCapabilities";
import { verifyPermissionOnProject } from "./ProjectResolver";
import { getConnection } from "typeorm";

@Resolver(UserOnProject)
export class UserManagementResolver {
  @FieldResolver(() => User)
  user(
    @Root() userOnProject: UserOnProject,
    @Ctx() { userLoader }: AppContext
  ) {
    return userLoader.load(userOnProject.userId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async addUserToProject(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int) id: number,
    @Arg("userId", () => Int) userId: number,
    @Arg("capabilities", () => UserProjectCapabilities, { nullable: true })
    capabilities?: UserProjectCapabilities,
    @Arg("rolePresetId", () => Int, { nullable: true }) rolePresetId?: number
  ): Promise<boolean> {
    if (!rolePresetId && !capabilities) {
      return false;
    }

    let realCapabilities: UserProjectCapabilities | null = null;

    if (rolePresetId) {
      const rolePresetString = Object.keys(RolePreset).find(
        (k: string) => RolePreset[k as Role].id === rolePresetId
      );

      if (rolePresetString) {
        realCapabilities = RolePreset[rolePresetString as Role].capabilities;
      }
    }

    if (capabilities && !realCapabilities) {
      realCapabilities = capabilities;
    }

    if (!realCapabilities) {
      return false;
    }

    verifyPermissionOnProject(id, req.session.userId, "canManageProjectUsers");

    await getConnection().transaction(async (transactionalEntityManager) => {
      await UserOnProject.delete({ projectId: id, userId });

      const participationOnProject = createUserOnProject(
        userId,
        id,
        realCapabilities!,
        rolePresetId
      );

      await transactionalEntityManager.save(participationOnProject);
    });

    return true;
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  async usersOnProject(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int) id: number
  ): Promise<UserOnProject[]> {
    verifyPermissionOnProject(id, req.session.userId, "canManageProjectUsers");

    return await UserOnProject.find({
      where: {
        projectId: id,
      },
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async removeUserFromProject(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int) id: number,
    @Arg("userId", () => Int) userId: number
  ): Promise<boolean> {
    verifyPermissionOnProject(id, req.session.userId, "canManageProjectUsers");

    await UserOnProject.delete({ projectId: id, userId });
    return true;
  }
}
