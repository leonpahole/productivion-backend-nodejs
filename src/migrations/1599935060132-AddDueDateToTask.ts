import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDueDateToTask1599935060132 implements MigrationInterface {
    name = 'AddDueDateToTask1599935060132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "dueDate" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "dueDate"`);
    }

}
