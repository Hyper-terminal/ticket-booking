import { Request, Response } from "express";
import { getDatabase } from "../config/database";

export class TicketController {
  public async getAvailableTickets(req: Request, res: Response) {
    try {
      const db = getDatabase();
      console.log("Getting available tickets");
      console.log(db);
      // Get count of available confirmed berths
      const confirmedBerths = await db("berths")
        .where("status", "Available")
        .andWhere("is_rac", false);

      res.json(confirmedBerths);
    } catch (error) {
      console.error("Error fetching available tickets:", error);
      res.status(500).json({
        error: "Failed to fetch available tickets",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public async bookTicket(req: Request, res: Response) {
    const db = getDatabase();
    const trx = await db.transaction();

    try {
      const { passengers, train_id } = req.body;

      if (!Array.isArray(passengers) || passengers.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one passenger is required" });
      }

      for (const passenger of passengers) {
        if (!passenger.name || !passenger.age || !passenger.gender) {
          return res.status(400).json({ error: "Invalid passenger data" });
        }
      }

      const [booking] = await trx("bookings")
        .insert({
          pnr_number: Math.random().toString(36).substring(2, 15),
          total_amount: 0,
        })
        .returning("booking_id");

      const bookingId = booking.booking_id;

      const children = passengers.filter((p) => p.age <= 5);
      const adults = passengers.filter((p) => p.age > 5);

      const females = adults
        .filter((p) => p.gender === "Female")
        .sort((a, b) => b.age - a.age);

      females.forEach((f) => (f.is_traveling_with_child = false));

      for (let i = 0; i < children.length && i < females.length; i++) {
        females[i].is_traveling_with_child = true;
      }

      const passengerData = passengers.map((p) => ({
        booking_id: bookingId,
        age: p.age,
        name: p.name,
        gender: p.gender,
        is_traveling_with_child: p.is_traveling_with_child || false,
      }));

      const passengerInserts = await trx("passengers")
        .insert(passengerData)
        .returning([
          "passenger_id",
          "age",
          "gender",
          "is_traveling_with_child",
        ]);

      const trainState = await trx("train_states")
        .where("train_id", train_id)
        .first()
        .forUpdate();

      let {
        available_confirmed_seats: availableConfirmed,
        available_rac_seats: availableRAC,
        max_waiting_list,
        current_waiting_list,
      } = trainState;

      availableConfirmed = Number(availableConfirmed);
      availableRAC = Number(availableRAC);

      if (current_waiting_list >= max_waiting_list) {
        await trx.rollback();
        return res
          .status(400)
          .json({ error: "No tickets available - waiting list is full" });
      }

      const tickets = [];
      const berthUpdates = [];

      const lowerBerths = await trx("berths")
        .join("coaches", "berths.coach_id", "coaches.coach_id")
        .where({
          "coaches.train_id": train_id,
          "berths.status": "Available",
          "berths.berth_type": "Lower",
          is_rac: false,
        })
        .select("berths.berth_id")
        .forUpdate();

      const allAvailableBerths = await trx("berths")
        .join("coaches", "berths.coach_id", "coaches.coach_id")
        .where("coaches.train_id", train_id)
        .andWhere({ "berths.status": "Available", is_rac: false })
        .whereNotIn(
          "berths.berth_id",
          lowerBerths.map((b) => b.berth_id)
        )
        .select("berths.berth_id")
        .forUpdate();

      let lowerIndex = 0;
      let allIndex = 0;

      for (const passenger of passengerInserts) {
        const { age, is_traveling_with_child, passenger_id } = passenger;

        if (age <= 5) {
          tickets.push({
            passenger_id,
            berth_id: null,
            status: "Confirmed",
          });
          continue;
        }

        let berth = null;

        if (
          (age >= 60 || is_traveling_with_child) &&
          lowerIndex < lowerBerths.length &&
          availableConfirmed > 0
        ) {
          berth = lowerBerths[lowerIndex++];
        } else if (
          allIndex < allAvailableBerths.length &&
          availableConfirmed > 0
        ) {
          berth = allAvailableBerths[allIndex++];
        }

        if (berth) {
          berthUpdates.push({ berth_id: berth.berth_id, status: "Booked" });
          tickets.push({
            passenger_id,
            berth_id: berth.berth_id,
            status: "Confirmed",
          });
          availableConfirmed--;
          continue;
        }

        if (availableRAC > 0) {
          const racBerth = await trx("berths")
            .join("coaches", "berths.coach_id", "coaches.coach_id")
            .where({
              "coaches.train_id": train_id,
              "berths.status": "Available",
              is_rac: true,
            })
            .first()
            .forUpdate();

          if (racBerth) {
            berthUpdates.push({ berth_id: racBerth.berth_id, status: "RAC" });
            tickets.push({
              passenger_id,
              berth_id: racBerth.berth_id,
              status: "RAC",
            });
            availableRAC--;
            continue;
          }
        }

        current_waiting_list++;
        tickets.push({
          passenger_id,
          berth_id: null,
          status: "Waiting",
        });
      }

      await trx("train_states").where("train_id", train_id).update({
        available_confirmed_seats: availableConfirmed,
        available_rac_seats: availableRAC,
        current_waiting_list,
      });

      if (berthUpdates.length > 0) {
        const caseStatements = berthUpdates
          .map((b, i) => `WHEN ${b.berth_id} THEN '${b.status}'`)
          .join(" ");
        const ids = berthUpdates.map((b) => b.berth_id).join(", ");

        await trx.raw(
          `UPDATE berths SET status = CASE berth_id ${caseStatements} END WHERE berth_id IN (${ids})`
        );
      }

      await trx("tickets").insert(tickets);
      await trx.commit();

      res.json({ message: "Tickets booked successfully", tickets });
    } catch (error) {
      await trx.rollback();
      console.error("Error booking ticket:", error);
      res.status(500).json({
        error: "Failed to book ticket",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
