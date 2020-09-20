import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsVerifiedToUser1600542738061 implements MigrationInterface {
  name = "AddIsVerifiedToUser1600542738061";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isVerified" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isVerified"`);
  }
}
