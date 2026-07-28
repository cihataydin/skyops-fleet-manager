import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1785226158403 implements MigrationInterface {
    name = 'Migrate1785226158403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drones" ADD "flight_hours_at_last_maintenance" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drones" DROP COLUMN "flight_hours_at_last_maintenance"`);
    }

}
