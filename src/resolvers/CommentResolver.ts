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
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { AppContext } from "../types/AppContext";
import { verifyPermissionOnProject } from "./ProjectResolver";
import { Comment } from "../entities/Comment";
import { User } from "../entities/User";

@InputType()
class CreateCommentInput {
  @Field()
  content: string;
}

@ObjectType()
class CommentsPaginatedResponse {
  @Field(() => [Comment])
  comments: Comment[];

  @Field()
  hasMore: boolean;
}

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver(() => User, { nullable: false })
  async author(
    @Root() comment: Comment,
    @Ctx() { userLoader }: AppContext
  ): Promise<User | null> {
    return userLoader.load(comment.authorId);
  }

  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async createComment(
    @Ctx() { req }: AppContext,
    @Arg("input") { content }: CreateCommentInput,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("taskId", () => Int, { nullable: true }) taskId?: number
  ): Promise<Comment | undefined> {
    await verifyPermissionOnProject(
      projectId,
      req.session.userId,
      "canComment"
    );
    const comment = new Comment();
    comment.content = content;
    comment.authorId = req.session.userId;
    comment.projectId = projectId;
    if (taskId) {
      comment.taskId = taskId;
    }

    await comment.save();

    return Comment.findOne({ where: { id: comment.id } });
  }

  @UseMiddleware(isAuth)
  @Query(() => CommentsPaginatedResponse)
  @UseMiddleware(isAuth)
  async comments(
    @Ctx() { req }: AppContext,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("offset", () => Int) offset: number,
    @Arg("limit", () => Int) limit: number,
    @Arg("taskId", () => Int, { nullable: true }) taskId?: number
  ): Promise<CommentsPaginatedResponse> {
    await verifyPermissionOnProject(projectId, req.session.userId, "view");

    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const comments = await Comment.find({
      where: { projectId, taskId: taskId ? taskId : null },
      order: { createdAt: "DESC" },
      skip: offset,
      take: realLimitPlusOne,
    });

    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length === realLimitPlusOne,
    };
  }

  @Mutation(() => Comment, { nullable: true })
  @UseMiddleware(isAuth)
  async updateComment(
    @Ctx() { req }: AppContext,
    @Arg("id", () => Int) id: number,
    @Arg("input") { content }: CreateCommentInput
  ): Promise<Comment | undefined> {
    const comment = await Comment.findOne({ where: { id } });
    if (!comment) {
      return undefined;
    }

    if (comment.authorId !== req.session.userId) {
      await verifyPermissionOnProject(
        comment.projectId,
        req.session.userId,
        "canUpdateOtherComments"
      );
    }

    comment.content = content;
    await comment.save();

    return comment;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("id", () => Int) id: number,
    @Arg("projectId", () => Int) projectId: number,
    @Ctx() { req }: AppContext
  ): Promise<boolean> {
    const comment = await Comment.findOne({ where: { id } });
    if (!comment) {
      return false;
    }

    if (comment.authorId !== req.session.userId) {
      await verifyPermissionOnProject(
        projectId,
        req.session.userId,
        "canDeleteOtherComments"
      );
    }

    await Comment.delete({
      id,
    });

    return true;
  }
}
