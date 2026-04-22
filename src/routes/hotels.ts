import { Router, type Request, type Response } from "express";
import { getTemporalClient } from "../temporal/client";
import { getHotelsFromCache, filterByPrice } from "../service/hotelService";
import { type HotelResult } from "../types/hotel";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { city, minPrice, maxPrice } = req.query;

  if (!city || typeof city !== "string") {
    return res.status(400).json({ error: "city query param is required" });
  }

  const min = minPrice ? parseFloat(minPrice as string) : undefined;
  const max = maxPrice ? parseFloat(maxPrice as string) : undefined;

  try {
    // Hit Redis first
    if (min !== undefined || max !== undefined) {
      const cached = await getHotelsFromCache(city);
      if (cached) {
        const filtered = filterByPrice(cached, min, max);
        return res.status(200).json(filtered);
      }
    }

    // On cache miss, trigger Temporal
    const client = await getTemporalClient();
    const handle = await client.workflow.start("hotelWorkflow", {
      taskQueue: process.env.TEMPORAL_TASK_QUEUE || "hotel-offers",
      workflowId: `hotel-offers-${city}-${Date.now()}`,
      args: [city],
    });

    const result: HotelResult[] = await handle.result();

    const finalResult = filterByPrice(result, min, max);

    return res.status(200).json(finalResult);
  } catch (err: any) {
    console.error("[/api/hotels] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch hotel offers",
      detail: err.message,
    });
  }
});

export default router;
