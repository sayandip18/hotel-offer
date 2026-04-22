# Hotel Offer Orchestrator

An ExpressJS service that aggregates hotel offers from two mock suppliers,
deduplicates hotels by name, selects the best-priced offer per hotel, caches results
in Redis, and orchestrates the comparison workflow using Temporal.io.
