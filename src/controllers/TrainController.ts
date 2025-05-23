import { Request, Response } from 'express';
import { getDatabase } from '../config/database';

export class TrainController {
  public async getTrainDetails(req: Request, res: Response) {
    try {
      const db = getDatabase();
      const trains = await db('trains')
        .select('*')

      res.json(trains);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch train details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
