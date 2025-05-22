import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('coaches', (table) => {
    table.increments('coach_id').primary();
    table.string('coach_name').notNullable();
    table.enum('coach_type', ['Sleeper', 'AC3', 'AC2', 'AC1', 'General']).notNullable();
    table.integer('train_id').unsigned().notNullable().references('train_id').inTable('trains').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('coaches');
} 