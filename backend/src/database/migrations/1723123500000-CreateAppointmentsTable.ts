import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentsTable1723123500000 implements MigrationInterface {
  name = 'CreateAppointmentsTable1723123500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`appointments\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`patient_id\` int NOT NULL,
        \`doctor_id\` int NOT NULL,
        \`scheduled_at\` datetime NOT NULL,
        \`duration_minutes\` int NOT NULL DEFAULT '30',
        \`status\` enum('booked', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
        \`created_by\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`notes\` text NULL,
        INDEX \`IDX_appointments_doctor_scheduled\` (\`doctor_id\`, \`scheduled_at\`),
        INDEX \`IDX_appointments_patient\` (\`patient_id\`),
        INDEX \`IDX_appointments_status\` (\`status\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_appointments_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_appointments_doctor\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_appointments_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`appointments\``);
  }
}
