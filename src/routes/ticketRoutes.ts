import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { getDatabase } from '../config/database';

const ticketController = new TicketController();
const router = Router();

// Book a new ticket
// router.post('/book', ticketController.bookTicket);

// // Cancel a ticket
// router.post('/cancel/:ticketId', ticketController.cancelTicket);

// // Get all booked tickets
// router.get('/booked', ticketController.getBookedTickets);

// Get available tickets
router.get('/available', ticketController.getAvailableTickets);

export default router; 