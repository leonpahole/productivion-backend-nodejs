import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjects1599406764113 implements MigrationInterface {
  name = "CreateProjects1599406764113";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "authorId" integer NOT NULL, CONSTRAINT "UQ_cb001317127de4d5e323b5c0c4e" UNIQUE ("title"), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_e89415fe16e98680d18ec760358" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_e89415fe16e98680d18ec760358"`
    );
    await queryRunner.query(`DROP TABLE "project"`);
  }
}
