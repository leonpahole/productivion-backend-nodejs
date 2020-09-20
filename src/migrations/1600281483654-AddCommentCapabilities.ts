import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCommentCapabilities1600281483654 implements MigrationInterface {
    name = 'AddCommentCapabilities1600281483654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_on_project" ADD "canComment" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_on_project" ADD "canUpdateOtherComments" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_on_project" ADD "canDeleteOtherComments" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_on_project" DROP COLUMN "canDeleteOtherComments"`);
        await queryRunner.query(`ALTER TABLE "user_on_project" DROP COLUMN "canUpdateOtherComments"`);
        await queryRunner.query(`ALTER TABLE "user_on_project" DROP COLUMN "canComment"`);
    }

}
