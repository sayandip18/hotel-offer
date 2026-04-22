import { Router, type Request, type Response } from "express";
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
    // If price filter requested, return from Redis first

    // If cache miss, trigger Temporal

    // Finally, apply price filter on result if needed

    return res.status(200).json([]);
  } catch (err: any) {
    console.error("[/api/hotels] Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch hotel offers",
      detail: err.message,
    });
  }
});

export default router;
