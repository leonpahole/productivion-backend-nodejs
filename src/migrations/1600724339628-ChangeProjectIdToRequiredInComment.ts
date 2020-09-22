import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeProjectIdToRequiredInComment1600724339628 implements MigrationInterface {
    name = 'ChangeProjectIdToRequiredInComment1600724339628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "projectId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee"`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "projectId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_61e5bdd38addac8d6219ca102ee" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
