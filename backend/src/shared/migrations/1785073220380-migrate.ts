import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrate1785073220380 implements MigrationInterface {
  name = 'Migrate1785073220380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."missions_status_enum" RENAME TO "missions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."missions_status_enum" AS ENUM('PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS', 'COMPLETED', 'ABORTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "missions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "missions" ALTER COLUMN "status" TYPE "public"."missions_status_enum" USING "status"::"text"::"public"."missions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "missions" ALTER COLUMN "status" SET DEFAULT 'PLANNED'`,
    );
    await queryRunner.query(`DROP TYPE "public"."missions_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."missions_status_enum_old" AS ENUM('PLANNED', 'PRE_FLIGHT_CHECK', 'IN_PROGRESS', 'COMPLETE', 'ABORTED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "missions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "missions" ALTER COLUMN "status" TYPE "public"."missions_status_enum_old" USING "status"::"text"::"public"."missions_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "missions" ALTER COLUMN "status" SET DEFAULT 'PLANNED'`,
    );
    await queryRunner.query(`DROP TYPE "public"."missions_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."missions_status_enum_old" RENAME TO "missions_status_enum"`,
    );
  }
}
