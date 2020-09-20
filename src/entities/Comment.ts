import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Task } from "./Task";
import { User } from "./User";
import { Project } from "./Project";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  content: string;

  @Column()
  authorId: number;

  @Field()
  @ManyToOne(() => User)
  author: User;

  @Column({ nullable: true })
  taskId?: number;

  @ManyToOne(() => Task, { nullable: true })
  task?: Task;

  @Column({ nullable: true })
  projectId?: number;

  @ManyToOne(() => Project, { nullable: true })
  project?: Project;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
