import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('train_states', (table) => {
    table.increments('train_state_id').primary();
    table.integer('train_id').unsigned().notNullable().references('train_id').inTable('trains').onDelete('CASCADE');
    
    // Confirmed seats tracking
    table.integer('total_confirmed_seats').notNullable().defaultTo(0);
    table.integer('available_confirmed_seats').notNullable().defaultTo(0);
    
    // RAC seats tracking
    table.integer('total_rac_seats').notNullable().defaultTo(0);
    table.integer('available_rac_seats').notNullable().defaultTo(0);
    
    // Waiting list tracking
    table.integer('max_waiting_list').notNullable().defaultTo(0);
    table.integer('current_waiting_list').notNullable().defaultTo(0);
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('train_states');
}