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
  InputType,
  Field,
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
import { IsEmail, Min } from "class-validator";
import { createGraphQLInputError } from "../utils/createGraphQLInputError";

@InputType()
class AddUserToProjectInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  capabilities: UserProjectCapabilities;

  @Field({ nullable: true })
  @Min(1)
  rolePresetId: number;
}

@Resolver(UserOnProject)
export class UserManagementResolver {
  @FieldResolver(() => User)
  user(
    @Root() userOnProject: UserOnProject,
    @Ctx() { userLoader }: AppContext
  ) {
    return userLoader.load(userOnProject.userId);
  }

  @Mutation(() => UserOnProject, { nullable: true })
  @UseMiddleware(isAuth)
  async addUserToProject(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int!) id: number,
    @Arg("input", () => AddUserToProjectInput)
    { email, capabilities, rolePresetId }: AddUserToProjectInput
  ): Promise<UserOnProject | undefined> {
    await verifyPermissionOnProject(
      id,
      req.session.userId,
      "canManageProjectUsers"
    );

    if (!rolePresetId && !capabilities) {
      throw createGraphQLInputError([
        {
          property: "unknown",
          constraints: {
            IsUnique: "Insufficient data",
          },
        },
      ]);
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
      throw createGraphQLInputError([
        {
          property: "unknown",
          constraints: {
            IsUnique: "Insufficient data",
          },
        },
      ]);
    }

    const userToAdd = await User.findOne({ where: { email } });
    if (!userToAdd) {
      throw createGraphQLInputError([
        {
          property: "email",
          constraints: {
            IsUnique: "Unknown email",
          },
        },
      ]);
    }

    let participationOnProject: UserOnProject | undefined;

    await getConnection().transaction(async (transactionalEntityManager) => {
      await UserOnProject.delete({ projectId: id, userId: userToAdd.id });

      participationOnProject = createUserOnProject(
        userToAdd.id,
        id,
        realCapabilities!,
        rolePresetId
      );

      await transactionalEntityManager.save(participationOnProject);
    });

    return participationOnProject;
  }

  @Query(() => [UserOnProject])
  @UseMiddleware(isAuth)
  async usersOnProject(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int) id: number
  ): Promise<UserOnProject[]> {
    await verifyPermissionOnProject(
      id,
      req.session.userId,
      "canManageProjectUsers"
    );

    return await UserOnProject.find({
      where: {
        projectId: id,
      },
      order: {
        createdAt: "DESC",
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
    await verifyPermissionOnProject(
      id,
      req.session.userId,
      "canManageProjectUsers"
    );

    await UserOnProject.delete({ projectId: id, userId });
    return true;
  }
}
