import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorsAndAvailabilityTables1723123300000 implements MigrationInterface {
  name = 'CreateDoctorsAndAvailabilityTables1723123300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`doctors\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`specialization\` varchar(100) NULL,
        \`gender\` enum('male', 'female', 'other') NULL,
        \`location\` varchar(200) NULL,
        \`phone\` varchar(20) NULL,
        \`notes\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`availability_slots\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`doctor_id\` int NOT NULL,
        \`date\` date NULL,
        \`day_of_week\` tinyint NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
        \`start_time\` time NOT NULL,
        \`end_time\` time NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_availability_doctor_id\` (\`doctor_id\`),
        CONSTRAINT \`FK_availability_doctor\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`availability_slots\``);
    await queryRunner.query(`DROP TABLE \`doctors\``);
  }
}
