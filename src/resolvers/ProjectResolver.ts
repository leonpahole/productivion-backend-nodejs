import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  Int,
  Root,
  FieldResolver,
} from "type-graphql";
import { Project } from "../entities/Project";
import { isAuth } from "../middleware/isAuth";
import { AppContext } from "../types/AppContext";
import { UserOnProject, createUserOnProject } from "../entities/UserOnProject";
import { getConnection } from "typeorm";
import {
  RolePreset,
  CapabilityId,
  UserProjectCapabilities,
} from "../types/UserProjectCapabilities";
import { AUTH_ERROR } from "../constants";
import { Length } from "class-validator";
import { Task } from "../entities/Task";

@InputType()
class CreateProjectInput {
  @Field()
  @Length(4, 40)
  title: string;

  @Field({ nullable: true })
  @Length(4, 250)
  description?: string;
}

@Resolver(Project)
export class ProjectResolver {
  @FieldResolver(() => UserProjectCapabilities, { nullable: false })
  async capabilities(
    @Root() project: Project,
    @Ctx() { req, capabilityLoader }: AppContext
  ): Promise<UserProjectCapabilities | null> {
    return capabilityLoader.load({
      userId: req.session.userId,
      projectId: project.id,
    });
  }

  @FieldResolver(() => Int, { nullable: false })
  async taskCount(@Root() project: Project): Promise<number> {
    return Task.count({ where: { projectId: project.id } });
  }

  @FieldResolver(() => Int, { nullable: false })
  async userCount(@Root() project: Project): Promise<number> {
    return UserOnProject.count({ where: { projectId: project.id } });
  }

  @Mutation(() => Project, { nullable: true })
  @UseMiddleware(isAuth)
  async createProject(
    @Ctx() { req }: AppContext,
    @Arg("input") { title, description }: CreateProjectInput
  ): Promise<Project | null> {
    let project = null;

    await getConnection().transaction(async (transactionalEntityManager) => {
      const insertResult = await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Project)
        .values({ title, description, authorId: req.session.userId })
        .returning("*")
        .execute();

      project = insertResult.raw[0];

      const projectId = insertResult.identifiers[0].id;

      const admin = RolePreset.ADMIN;

      const participationOnProject = createUserOnProject(
        req.session.userId,
        projectId,
        admin.capabilities,
        admin.id
      );

      await transactionalEntityManager.save(participationOnProject);
    });

    return project;
  }

  @Query(() => [Project])
  @UseMiddleware(isAuth)
  async myProjects(@Ctx() { req }: AppContext): Promise<Project[]> {
    const projects = getConnection().query(
      `
        SELECT p.*
        FROM project p
        LEFT JOIN user_on_project
        ON user_on_project."projectId" = p.id
        WHERE user_on_project."userId" = $1
        ORDER BY p."createdAt" DESC;
      `,
      [req.session.userId]
    );

    return projects;
  }

  @Query(() => Project, { nullable: true })
  @UseMiddleware(isAuth)
  async project(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: AppContext
  ): Promise<Project | undefined> {
    await verifyPermissionOnProject(id, req.session.userId, "view");
    return Project.findOne({ id });
  }

  @Mutation(() => Project, { nullable: true })
  @UseMiddleware(isAuth)
  async updateProject(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int) id: number,
    @Arg("input") { title, description }: CreateProjectInput
  ): Promise<Project | undefined> {
    await verifyPermissionOnProject(id, req.session.userId, "canUpdateProject");
    await Project.update(
      { id },
      {
        title,
        description,
      }
    );

    return Project.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProject(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: AppContext
  ): Promise<boolean> {
    await verifyPermissionOnProject(id, req.session.userId, "canDeleteProject");
    await Project.delete({
      id,
    });
    return true;
  }
}

export const verifyPermissionOnProject = async (
  projectId: number,
  userId: number,
  capability: CapabilityId
) => {
  let q = { where: { projectId, userId } };

  if (capability !== "view") {
    q = { where: { ...q.where, [capability]: true } };
  }

  const result = await UserOnProject.findOne(q);

  if (result == null) {
    throw new Error(AUTH_ERROR);
  }
};
