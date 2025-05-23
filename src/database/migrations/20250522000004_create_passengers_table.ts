import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('passengers', (table) => {
    table.increments('passenger_id').primary();
    table.integer('booking_id').unsigned().notNullable().references('booking_id').inTable('bookings').onDelete('CASCADE');
    table.string('name').notNullable();
    table.integer('age').notNullable();
    table.enum('gender', ['Male', 'Female', 'Other']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.enum('status', ['Confirmed', 'Cancelled', 'Waiting']).defaultTo('Confirmed');
    table.boolean('is_traveling_with_child').defaultTo(false).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('passengers');
} 