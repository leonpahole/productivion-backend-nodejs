import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultCompletedToTask1599923032385 implements MigrationInterface {
    name = 'AddDefaultCompletedToTask1599923032385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "completed" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "completed" DROP DEFAULT`);
    }

}
