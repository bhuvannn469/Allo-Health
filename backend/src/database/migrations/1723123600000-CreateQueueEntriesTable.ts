import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQueueEntriesTable1723123600000 implements MigrationInterface {
  name = 'CreateQueueEntriesTable1723123600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`queue_entries\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`patient_id\` int NOT NULL,
        \`queue_number\` int NOT NULL,
        \`priority\` int NOT NULL DEFAULT '1' COMMENT 'Higher number = higher priority',
        \`status\` enum('waiting', 'with_doctor', 'completed', 'skipped') NOT NULL DEFAULT 'waiting',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`notes\` text NULL,
        UNIQUE INDEX \`IDX_queue_entries_queue_number\` (\`queue_number\`),
        INDEX \`IDX_queue_entries_patient\` (\`patient_id\`),
        INDEX \`IDX_queue_entries_status\` (\`status\`),
        INDEX \`IDX_queue_entries_priority\` (\`priority\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_queue_entries_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`queue_entries\``);
  }
}
