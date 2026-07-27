import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1785169193549 implements MigrationInterface {
    name = 'Migrate1785169193549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance_logs" ADD "version" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "drones" ADD "version" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "version" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "drones" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "maintenance_logs" DROP COLUMN "version"`);
    }

}
