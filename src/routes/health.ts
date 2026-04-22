import { Router, type Request, type Response } from "express";
import axios from "axios";
import { getRedisClient } from "../config/redis";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const baseUrl = process.env.SUPPLIER_BASE_URL || "http://localhost:3000";

  const [supplierAStatus, supplierBStatus, redisStatus] = await Promise.all([
    axios
      .get(`${baseUrl}/supplierA/hotels?city=ping`)
      .then(() => "ok")
      .catch(() => "error"),

    axios
      .get(`${baseUrl}/supplierB/hotels?city=ping`)
      .then(() => "ok")
      .catch(() => "error"),

    getRedisClient()
      .ping()
      .then(() => "ok")
      .catch(() => "error"),
  ]);

  const allOk =
    supplierAStatus === "ok" &&
    supplierBStatus === "ok" &&
    redisStatus === "ok";

  res.status(allOk ? 200 : 503).json({
    status: allOk ? "ok" : "degraded",
    services: {
      supplierA: supplierAStatus,
      supplierB: supplierBStatus,
      redis: redisStatus,
    },
  });
});

export default router;
