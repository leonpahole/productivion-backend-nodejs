import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Project } from "./Project";
import { User } from "./User";
import { UserProjectCapabilities } from "../types/UserProjectCapabilities";

// ADD CAPABILITY
@ObjectType()
@Entity()
export class UserOnProject extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @Field(() => Int)
  @PrimaryColumn()
  projectId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.onProjects)
  user: User;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.users, {
    onDelete: "CASCADE",
  })
  project: Project;

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  presetId?: number;

  @Column({ default: false })
  canUpdateProject: boolean;

  @Column({ default: false })
  canDeleteProject: boolean;

  @Column({ default: false })
  canAddTask: boolean;

  @Column({ default: false })
  canUpdateTask: boolean;

  @Column({ default: false })
  canDeleteTask: boolean;

  @Column({ default: false })
  canCompleteTask: boolean;

  @Column({ default: false })
  canManageProjectUsers: boolean;

  @Column({ default: false })
  canComment: boolean;

  @Column({ default: false })
  canUpdateOtherComments: boolean;

  @Column({ default: false })
  canDeleteOtherComments: boolean;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

// ADD CAPABILITY
export const createUserOnProject = (
  userId: number,
  projectId: number,
  capabilities: UserProjectCapabilities,
  presetId?: number
): UserOnProject => {
  const userOnProject = new UserOnProject();
  userOnProject.userId = userId;
  userOnProject.projectId = projectId;

  userOnProject.canUpdateProject = capabilities.canUpdateProject;
  userOnProject.canDeleteProject = capabilities.canDeleteProject;
  userOnProject.canAddTask = capabilities.canAddTask;
  userOnProject.canUpdateTask = capabilities.canUpdateTask;
  userOnProject.canDeleteTask = capabilities.canDeleteTask;
  userOnProject.canCompleteTask = capabilities.canCompleteTask;
  userOnProject.canManageProjectUsers = capabilities.canManageProjectUsers;
  userOnProject.canComment = capabilities.canComment;
  userOnProject.canUpdateOtherComments = capabilities.canUpdateOtherComments;
  userOnProject.canDeleteOtherComments = capabilities.canDeleteOtherComments;

  userOnProject.presetId = presetId;

  return userOnProject;
};
