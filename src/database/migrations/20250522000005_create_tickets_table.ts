import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tickets', (table) => {
    table.increments('ticket_id').primary();
    table.integer('passenger_id').unsigned().notNullable().references('passenger_id').inTable('passengers').onDelete('CASCADE');
    table.integer('berth_id').unsigned().notNullable().references('berth_id').inTable('berths').onDelete('CASCADE');
    table.enum('status', ['Confirmed', 'Cancelled', 'Waiting', 'RAC']).defaultTo('Waiting');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tickets');
} 