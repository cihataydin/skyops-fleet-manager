import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrate1785323101860 implements MigrationInterface {
    name = 'Migrate1785323101860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."maintenance_logs_type_enum" AS ENUM('ROUTINE_CHECK', 'BATTERY_REPLACEMENT', 'MOTOR_REPAIR', 'FIRMWARE_UPDATE', 'FULL_OVERHAUL')`);
        await queryRunner.query(`CREATE TABLE "maintenance_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "drone_id" uuid NOT NULL, "type" "public"."maintenance_logs_type_enum" NOT NULL, "technician_name" character varying(255) NOT NULL, "notes" character varying(500), "performed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "flight_hours_at_maintenance" numeric(10,2) NOT NULL, CONSTRAINT "PK_096e4b6bb7c9fe74d960e7523e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."drones_model_enum" AS ENUM('PHANTOM_4', 'MATRICE_300', 'MAVIC_3_ENTERPRISE')`);
        await queryRunner.query(`CREATE TYPE "public"."drones_status_enum" AS ENUM('AVAILABLE', 'IN_MISSION', 'MAINTENANCE', 'RETIRED')`);
        await queryRunner.query(`CREATE TABLE "drones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "serial_number" character varying(13) NOT NULL, "model" "public"."drones_model_enum" NOT NULL, "status" "public"."drones_status_enum" NOT NULL DEFAULT 'AVAILABLE', "total_flight_hours" numeric(10,2) NOT NULL DEFAULT '0', "flight_hours_at_last_maintenance" numeric(10,2) NOT NULL DEFAULT '0', "last_maintenance_date" TIMESTAMP WITH TIME ZONE, "next_maintenance_due_date" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_c58fb0d50272dda6c64e7ee3acf" UNIQUE ("serial_number"), CONSTRAINT "PK_3137fc855d37186eeccd193569f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."missions_type_enum" AS ENUM('WIND_TURBINE_INSPECTION', 'SOLAR_PANEL_SURVEY', 'POWER_LINE_PATROL')`);
        await queryRunner.query(`CREATE TYPE "public"."missions_status_enum" AS ENUM('PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS', 'COMPLETED', 'ABORTED')`);
        await queryRunner.query(`CREATE TABLE "missions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "name" character varying(255) NOT NULL, "type" "public"."missions_type_enum" NOT NULL, "drone_id" uuid NOT NULL, "pilot_name" character varying(255) NOT NULL, "site_location" character varying(255) NOT NULL, "scheduled_start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "scheduled_end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "actual_start_time" TIMESTAMP WITH TIME ZONE, "actual_end_time" TIMESTAMP WITH TIME ZONE, "status" "public"."missions_status_enum" NOT NULL DEFAULT 'PLANNED', "flight_hours_at_completion" numeric(10,2) NOT NULL DEFAULT '0', "abort_reason" character varying(255), CONSTRAINT "PK_787aebb1ac5923c9904043c6309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "maintenance_logs" ADD CONSTRAINT "FK_fba8bd6c2957f15780d933c3570" FOREIGN KEY ("drone_id") REFERENCES "drones"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "missions" ADD CONSTRAINT "FK_d3118ce623080aa9d3499577f6e" FOREIGN KEY ("drone_id") REFERENCES "drones"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "missions" DROP CONSTRAINT "FK_d3118ce623080aa9d3499577f6e"`);
        await queryRunner.query(`ALTER TABLE "maintenance_logs" DROP CONSTRAINT "FK_fba8bd6c2957f15780d933c3570"`);
        await queryRunner.query(`DROP TABLE "missions"`);
        await queryRunner.query(`DROP TYPE "public"."missions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."missions_type_enum"`);
        await queryRunner.query(`DROP TABLE "drones"`);
        await queryRunner.query(`DROP TYPE "public"."drones_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."drones_model_enum"`);
        await queryRunner.query(`DROP TABLE "maintenance_logs"`);
        await queryRunner.query(`DROP TYPE "public"."maintenance_logs_type_enum"`);
    }

}
