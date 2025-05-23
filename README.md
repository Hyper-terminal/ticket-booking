# Train Ticket Booking System

A professional TypeScript backend server for managing train ticket bookings, built with Express.js and PostgreSQL.

## Features

- Multiple train configurations
- Different coach types (AC1, AC2, AC3, Sleeper, General)
- Berth management (Lower, Middle, Upper, Side Lower, Side Upper)
- RAC and waiting list system
- Special considerations for children and female travelers

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v16+)
- pnpm (v10.11.0+)

## Quick Start

1. Clone and install:
```bash
git clone <repository-url>
cd ticket-booking
pnpm install
```

2. Set up environment:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticket_booking
```

3. Start with Docker:
```bash
docker-compose up
```

4. Run migrations and seed:
```bash
docker-compose exec app pnpm run migrate --knexfile src/knexfile.ts
docker-compose exec app pnpm run seed --knexfile src/knexfile.ts
```

## API Endpoints

### Trains
- `GET /api/v1/trains` - List all trains
- `GET /api/v1/trains/:id` - Get train details

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:pnr` - Get booking details

### Tickets
- `GET /api/v1/tickets/available` - Check availability
- `POST /api/v1/tickets/book` - Book tickets
