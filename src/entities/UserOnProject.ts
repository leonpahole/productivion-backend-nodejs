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

@ObjectType()
@Entity()
export class UserOnProject extends BaseEntity {
  @Field(() => Int)
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

  @Column({ type: "int", nullable: true })
  presetId?: number;

  @Field()
  @Column({ default: false })
  canUpdateProject: boolean;

  @Field()
  @Column({ default: false })
  canDeleteProject: boolean;

  @Field()
  @Column({ default: false })
  canAddTask: boolean;

  @Field()
  @Column({ default: false })
  canUpdateTask: boolean;

  @Field()
  @Column({ default: false })
  canDeleteTask: boolean;

  @Field()
  @Column({ default: false })
  canCompleteTask: boolean;

  @Field()
  @Column({ default: false })
  canManageProjectUsers: boolean;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}

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

  userOnProject.presetId = presetId;

  return userOnProject;
};
