import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
  ObjectType,
} from "type-graphql";
import { Task } from "../entities/Task";
import { isAuth } from "../middleware/isAuth";
import { AppContext } from "../types/AppContext";
import { verifyPermissionOnProject } from "./ProjectResolver";

@InputType()
class CreateTaskInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  dueDate?: Date;
}

@ObjectType()
class TasksPaginatedResponse {
  @Field(() => [Task])
  tasks: Task[];

  @Field()
  hasMore: boolean;
}

@Resolver()
export class TaskResolver {
  @Mutation(() => Task, { nullable: true })
  @UseMiddleware(isAuth)
  async createTask(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("input") { title, description, dueDate }: CreateTaskInput,
    @Arg("parentTaskId", () => Int, { nullable: true }) parentTaskId?: number
  ): Promise<Task | undefined> {
    await verifyPermissionOnProject(
      projectId,
      req.session.userId,
      "canAddTask"
    );
    const task = new Task();
    task.title = title;
    task.description = description;
    task.parentTaskId = parentTaskId;
    task.authorId = req.session.userId;
    task.projectId = projectId;
    task.dueDate = dueDate;

    await task.save();

    return Task.findOne({ where: { id: task.id } });
  }

  @Query(() => TasksPaginatedResponse)
  @UseMiddleware(isAuth)
  async tasks(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("offset", () => Int) offset: number,
    @Arg("limit", () => Int) limit: number,
    @Arg("parentTaskId", () => Int, { nullable: true })
    parentTaskId: number | null = null
  ): Promise<TasksPaginatedResponse> {
    await verifyPermissionOnProject(projectId, req.session.userId, "view");

    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const tasks = await Task.find({
      where: { projectId, parentTaskId },
      order: { createdAt: "DESC" },
      skip: offset,
      take: realLimitPlusOne,
    });

    return {
      tasks: tasks.slice(0, realLimit),
      hasMore: tasks.length === realLimitPlusOne,
    };
  }

  @Query(() => Task, { nullable: true })
  @UseMiddleware(isAuth)
  async task(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: AppContext
  ): Promise<Task | undefined> {
    await verifyPermissionOnProject(projectId, req.session.userId, "view");
    return Task.findOne({ where: { id, projectId } });
  }

  @Mutation(() => Task, { nullable: true })
  @UseMiddleware(isAuth)
  async updateTask(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Arg("input") { title, description, dueDate }: CreateTaskInput
  ): Promise<Task | undefined> {
    await verifyPermissionOnProject(
      projectId,
      req.session.userId,
      "canUpdateTask"
    );
    await Task.update(
      { id, projectId },
      {
        title,
        description,
        dueDate,
      }
    );

    return Task.findOne({ where: { id, projectId } });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteTask(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: AppContext
  ): Promise<boolean> {
    await verifyPermissionOnProject(
      projectId,
      req.session.userId,
      "canDeleteTask"
    );
    await Task.delete({
      id,
      projectId,
    });
    return true;
  }

  @Mutation(() => Task, { nullable: true })
  @UseMiddleware(isAuth)
  async completeTask(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Arg("isCompleted") isCompleted: boolean,
    @Ctx() { req }: AppContext
  ): Promise<Task | undefined> {
    await verifyPermissionOnProject(
      projectId,
      req.session.userId,
      "canCompleteTask"
    );
    await Task.update(
      {
        id,
        projectId,
      },
      {
        completed: isCompleted,
      }
    );

    return Task.findOne(id);
  }
}
