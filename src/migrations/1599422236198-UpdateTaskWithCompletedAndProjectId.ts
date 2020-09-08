import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTaskWithCompletedAndProjectId1599422236198
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ADD "completed" boolean NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD "projectId" integer NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_8bf6d736c49d48d91691ea0dfe5"`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "parentTaskId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_8bf6d736c49d48d91691ea0dfe5" FOREIGN KEY ("parentTaskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_8bf6d736c49d48d91691ea0dfe5"`
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "parentTaskId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_8bf6d736c49d48d91691ea0dfe5" FOREIGN KEY ("parentTaskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "projectId"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "completed"`);
  }
}
