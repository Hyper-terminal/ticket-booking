import { Request, Response } from "express";
import { Knex } from "knex";
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
}
