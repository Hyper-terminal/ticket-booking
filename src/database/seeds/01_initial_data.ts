import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("passengers").del();
  await knex("bookings").del();
  await knex("berths").del();
  await knex("coaches").del();
  await knex("trains").del();
  await knex("train_states").del();

  // Inserts single train
  const train = await knex("trains")
    .insert({
      train_code: "12345",
      train_name: "Express Train"
    })
    .returning("*");

  const trainId = train[0].train_id;

  // Create train state
  await knex("train_states").insert({
    train_id: trainId,
    total_confirmed_seats: 63,
    available_confirmed_seats: 63,
    total_rac_seats: 9,
    available_rac_seats: 9,
    max_waiting_list: 10,
    current_waiting_list: 0
  });

  // Inserts single coach
  const coach = await knex("coaches")
    .insert({
      train_id: trainId,
      coach_type: "AC3",
      coach_name: "B1",
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning("*");

  const coachId = coach[0].coach_id;

  // Create 63 confirmed berths
  const berthTypes = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper"];
  
  for (let i = 0; i < 63; i++) {
    await knex("berths").insert({
      coach_id: coachId,
      berth_number: i + 1,
      berth_type: berthTypes[i % berthTypes.length],
      status: "Available",
      is_rac: false,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Create 9 RAC berths (side-lower berths)
  for (let i = 0; i < 9; i++) {
    await knex("berths").insert({
      coach_id: coachId,
      berth_number: i + 64, // Start from 64 to avoid conflicts with confirmed berths
      berth_type: "Side Lower",
      status: "Available",
      is_rac: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
}
