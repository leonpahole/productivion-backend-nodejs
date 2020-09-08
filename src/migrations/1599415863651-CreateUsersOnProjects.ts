import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersOnProjects1599415863651 implements MigrationInterface {
  name = "CreateUsersOnProjects1599415863651";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_on_project" ("userId" integer NOT NULL, "projectId" integer NOT NULL, "presetId" integer, "canUpdateProject" boolean NOT NULL DEFAULT false, "canDeleteProject" boolean NOT NULL DEFAULT false, "canAddTask" boolean NOT NULL DEFAULT false, "canUpdateTask" boolean NOT NULL DEFAULT false, "canDeleteTask" boolean NOT NULL DEFAULT false, "canCompleteTask" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8e401722cf048d30a83bc1dbc9d" PRIMARY KEY ("userId", "projectId"))`
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "UQ_cb001317127de4d5e323b5c0c4e"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_on_project" ADD CONSTRAINT "FK_5b260777f2dc38a256b00ebd969" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_on_project" ADD CONSTRAINT "FK_450beba015d3a317cb3d4985ad0" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_on_project" DROP CONSTRAINT "FK_450beba015d3a317cb3d4985ad0"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_on_project" DROP CONSTRAINT "FK_5b260777f2dc38a256b00ebd969"`
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "UQ_cb001317127de4d5e323b5c0c4e" UNIQUE ("title")`
    );
    await queryRunner.query(`DROP TABLE "user_on_project"`);
  }
}
