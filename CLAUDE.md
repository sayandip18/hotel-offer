# Hotel Offer Orchestrator — CLAUDE.md

This file gives Claude Code context about the project structure, conventions, and
commands needed to work effectively in this codebase.

---

## Project Overview

A Node.js + TypeScript service that aggregates hotel offers from two mock suppliers,
deduplicates hotels by name, selects the best-priced offer per hotel, caches results
in Redis, and orchestrates the comparison workflow using Temporal.io.

---

## Tech Stack

| Layer         | Technology              |
| ------------- | ----------------------- |
| Runtime       | Node.js (TypeScript)    |
| HTTP Server   | Express                 |
| Orchestration | Temporal.io             |
| Cache         | Redis                   |
| Containers    | Docker + Docker Compose |

---

## Project Structure

```
hotel-offer-orchestrator/
├── src/
│   ├── config/
│   │   └── redis.ts               # Redis client (ioredis) singleton
│   ├── mock/
│   │   ├── supplierA.ts           # Mock Supplier A — Express router + static data
│   │   └── supplierB.ts           # Mock Supplier B — Express router + static data
│   ├── temporal/
│   │   ├── client.ts              # Temporal client initialization
│   │   ├── worker.ts              # Temporal worker — registers workflows & activities
│   │   ├── workflows/
│   │   │   └── hotelWorkflow.ts   # Orchestration: parallel fetch → dedupe → return
│   │   └── activities/
│   │       ├── fetchSupplierA.ts  # HTTP call to /supplierA/hotels
│   │       ├── fetchSupplierB.ts  # HTTP call to /supplierB/hotels
│   │       └── dedupeHotels.ts    # Dedupe by name, select cheaper price
│   ├── routes/
│   │   └── hotels.ts              # GET /api/hotels route handler
│   ├── services/
│   │   └── hotelService.ts        # Redis save + price-range filter logic
│   ├── types/
│   │   └── hotel.ts               # Shared TypeScript interfaces
│   └── app.ts                     # Express app factory — mounts all routes
├── index.ts                       # Express server entry point
├── worker.ts                      # Temporal worker entry point (separate process)
├── postman/
│   └── hotel-orchestrator.json
├── .env
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Defined in `.env` (copy from `.env.example`):

```
PORT=3000
REDIS_URL=redis://localhost:6379
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=hotel-offers
SUPPLIER_BASE_URL=http://localhost:3000   # Internal base URL for activity HTTP calls
```

---

## Key Commands

```bash
# Install dependencies
npm install

# Run in development (ts-node, hot reload)
npm run dev           # starts Express server
npm run dev:worker    # starts Temporal worker (separate terminal)

# Build TypeScript
npm run build

# Docker (recommended for full stack)
docker-compose up --build
```

---

## API Endpoints

### Public

| Method | Path                                                 | Description                                                    |
| ------ | ---------------------------------------------------- | -------------------------------------------------------------- |
| GET    | `/api/hotels?city=delhi`                             | Returns deduplicated best-price hotel list                     |
| GET    | `/api/hotels?city=delhi&minPrice=3000&maxPrice=8000` | Same, filtered by price range from Redis                       |
| GET    | `/health`                                            | Health check — reports status of Supplier A, Supplier B, Redis |

### Mock Suppliers (internal)

| Method | Path                           | Description            |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/supplierA/hotels?city=delhi` | Supplier A static data |
| GET    | `/supplierB/hotels?city=delhi` | Supplier B static data |

---

## Core Data Flow

```
GET /api/hotels?city=delhi
        │
        ▼
  hotels.ts route
        │
        ▼
  Temporal client — starts hotelWorkflow
        │
        ▼
  hotelWorkflow.ts
    ├── fetchSupplierA (activity) ──► GET /supplierA/hotels?city=delhi
    └── fetchSupplierB (activity) ──► GET /supplierB/hotels?city=delhi
        │  (parallel via Promise.all)
        ▼
  dedupeHotels (activity)
    - Merge both arrays
    - Group by hotel name (case-insensitive)
    - Pick cheaper price per name
        │
        ▼
  hotelService.ts
    - Save deduplicated list to Redis (key: hotels:<city>)
    - Apply minPrice/maxPrice filter if provided
        │
        ▼
  JSON response to client
```

---

## TypeScript Interfaces (`src/types/hotel.ts`)

```typescript
// Raw data from supplier endpoints
interface SupplierHotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

// Final response shape returned to client
interface HotelResult {
  name: string;
  price: number;
  supplier: string; // "Supplier A" | "Supplier B"
  commissionPct: number;
}
```

---

## Temporal Conventions

- **Task Queue:** `hotel-offers` (set via `TEMPORAL_TASK_QUEUE` env var)
- **Workflow ID pattern:** `hotel-offers-<city>-<timestamp>`
- Workflows must **never** import Node.js built-ins or make direct HTTP calls —
  all I/O belongs in activities.
- Activities (`fetchSupplierA`, `fetchSupplierB`) use `axios` for HTTP calls.
- The worker process (`worker.ts`) registers both workflows and activities and
  must be running **before** any workflow can be triggered.

---

## Redis Conventions

- **Client:** `ioredis` singleton in `src/config/redis.ts`
- **Cache key pattern:** `hotels:<city>` (e.g. `hotels:delhi`)
- **Value:** JSON-stringified `HotelResult[]`
- **TTL:** 300 seconds (5 minutes) — set on every write
- Price filtering (`minPrice` / `maxPrice`) is applied **after** reading from
  Redis, in-memory in `hotelService.ts`

---

## Supplier Data — Overlapping Hotels (Delhi)

These hotels appear in both mocks to enable meaningful deduplication:

| Hotel       | Supplier A | Supplier B | Winner |
| ----------- | ---------- | ---------- | ------ |
| Holtin      | 6000       | 5340       | B      |
| Radison     | 5900       | 6200       | A      |
| Grand Hyatt | 8500       | 8100       | B      |
| Lemon Tree  | 3200       | 3500       | A      |

Supplier-exclusive hotels (no overlap): `Taj Palace` (A only), `Bloom Suites` (B only).

---

## Error Handling Conventions

- All activity functions should wrap logic in `try/catch` and throw meaningful
  errors — Temporal will handle retries automatically.
- Express route handlers should catch workflow errors and return `500` with a
  structured JSON body: `{ error: string, detail?: string }`.
- If a supplier is unreachable, the workflow should still attempt to return
  results from the available supplier rather than failing entirely.

---

## Docker Compose Services

```yaml
services:
  app: # Express + Temporal worker (or split into two services)
  redis: # redis:7-alpine, port 6379
  temporal: # temporalio/auto-setup, port 7233
```

The `app` service depends on both `redis` and `temporal` being healthy before starting.

---

## Postman Collection (`postman/hotel-orchestrator.json`)

Covers:

1. `GET /api/hotels?city=delhi` — valid city with overlapping results
2. `GET /api/hotels?city=delhi&minPrice=3000&maxPrice=6000` — price filtered
3. `GET /api/hotels?city=unknown` — city with no results (expect `[]`)
4. `GET /health` — health check
5. _(Optional)_ Supplier-down simulation via environment variable toggle
