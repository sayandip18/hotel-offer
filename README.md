# Hotel Offer Orchestrator

An ExpressJS service that aggregates hotel offers from two mock suppliers,
deduplicates hotels by name, selects the best-priced offer per hotel, caches results
in Redis, and orchestrates the comparison workflow using Temporal.io.

## Running the App

### With Docker (recommended)

```bash
docker-compose up --build
```

This starts the Express server, Temporal worker, Redis, and Temporal all together.

### Without Docker

1. Copy the example env file and fill in values:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start Redis and Temporal locally, then in two separate terminals:

```bash
npm run dev           # Express server on port 3000
npm run dev:worker    # Temporal worker
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hotels?city=delhi` | Deduplicated best-price hotel list |
| GET | `/api/hotels?city=delhi&minPrice=3000&maxPrice=8000` | Filtered by price range |
| GET | `/health` | Health check |
