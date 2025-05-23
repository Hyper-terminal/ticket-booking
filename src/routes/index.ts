import { Router } from 'express';
import ticketRoutes from './ticketRoutes';
import trainRoutes from './trainRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ticket routes
router.use('/tickets', ticketRoutes);
router.use('/train', trainRoutes);

export default router; 