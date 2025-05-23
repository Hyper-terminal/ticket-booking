import { Router } from 'express';
import { TrainController } from '../controllers/trainController';

const trainController = new TrainController();
const router = Router();

// get train details
router.get('/', trainController.getTrainDetails);

export default router; 