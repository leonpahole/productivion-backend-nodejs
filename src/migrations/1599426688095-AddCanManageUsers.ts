import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCanManageUsers1599426688095 implements MigrationInterface {
    name = 'AddCanManageUsers1599426688095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_on_project" ADD "canManageProjectUsers" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_on_project" DROP COLUMN "canManageProjectUsers"`);
    }

}
