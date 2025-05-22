import { Router } from 'express';
import ticketRoutes from './ticketRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ticket routes
router.use('/tickets', ticketRoutes);

export default router; 