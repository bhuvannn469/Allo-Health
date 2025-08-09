import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientsTable1723123400000 implements MigrationInterface {
  name = 'CreatePatientsTable1723123400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`patients\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`phone\` varchar(20) NOT NULL,
        \`dob\` date NULL,
        \`notes\` text NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_patients_phone\` (\`phone\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`patients\``);
  }
}
