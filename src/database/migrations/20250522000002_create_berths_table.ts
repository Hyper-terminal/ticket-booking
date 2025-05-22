import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('berths', (table) => {
    table.increments('berth_id').primary();
    table.integer('coach_id').unsigned().notNullable().references('coach_id').inTable('coaches').onDelete('CASCADE');
    table.enum('berth_type', ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper']).notNullable();
    table.integer('berth_number').notNullable();
    table.enum('status', ['Available', 'Booked', 'RAC', 'Waiting']).defaultTo('Available');
    table.boolean('is_rac').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('berths');
} 