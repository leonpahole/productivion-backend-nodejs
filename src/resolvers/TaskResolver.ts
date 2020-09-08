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
}

@Resolver()
export class TaskResolver {
  @Mutation(() => Task, { nullable: true })
  @UseMiddleware(isAuth)
  async createTask(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("input") { title, description }: CreateTaskInput,
    @Arg("parentTaskId", () => Int, { nullable: true }) parentTaskId?: number
  ): Promise<Task> {
    verifyPermissionOnProject(projectId, req.session.userId, "canAddTask");
    const task = new Task();
    task.title = title;
    task.description = description;
    task.parentTaskId = parentTaskId;
    task.authorId = req.session.userId;
    task.projectId = projectId;

    await task.save();
    return task;
  }

  @Query(() => [Task])
  @UseMiddleware(isAuth)
  async tasks(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("parentTaskId", () => Int, { nullable: true }) parentTaskId?: number
  ): Promise<Task[]> {
    verifyPermissionOnProject(projectId, req.session.userId, "view");
    return Task.find({ where: { projectId, parentTaskId } });
  }

  @Query(() => [Task])
  @UseMiddleware(isAuth)
  async task(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: AppContext
  ): Promise<Task | undefined> {
    verifyPermissionOnProject(projectId, req.session.userId, "view");
    return Task.findOne({ where: { id, projectId } });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateTask(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Arg("input") { title, description }: CreateTaskInput
  ): Promise<boolean> {
    verifyPermissionOnProject(projectId, req.session.userId, "canUpdateTask");
    await Task.update(
      { id, projectId },
      {
        title,
        description,
      }
    );

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteTask(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: AppContext
  ): Promise<boolean> {
    verifyPermissionOnProject(projectId, req.session.userId, "canDeleteTask");
    await Task.delete({
      id,
      projectId,
    });
    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async completeTask(
    @Arg("projectId", () => Int) projectId: number,
    @Arg("id", () => Int) id: number,
    @Arg("isCompleted") isCompleted: boolean,
    @Ctx() { req }: AppContext
  ): Promise<boolean> {
    verifyPermissionOnProject(projectId, req.session.userId, "canCompleteTask");
    await Task.update(
      {
        id,
        projectId,
      },
      {
        completed: isCompleted,
      }
    );
    return true;
  }
}
