import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Project } from "./Project";

@ObjectType()
@Entity()
export class Task extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ defaultValue: false })
  @Column()
  completed: boolean;

  @Field()
  @Column()
  authorId: number;

  @ManyToOne(() => User)
  author: User;

  @Field()
  @Column()
  projectId: number;

  @ManyToOne(() => Project)
  project: Project;

  @Field({ nullable: true })
  @Column({ nullable: true })
  parentTaskId?: number;

  @ManyToOne(() => Task, (task) => task.subTasks)
  parentTask: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subTasks: Task[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
