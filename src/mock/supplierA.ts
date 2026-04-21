import { Router, type Request, type Response } from "express";

const router = Router();

const hotelsA = [
  {
    hotelId: "a1",
    name: "Holtin",
    price: 6000,
    city: "delhi",
    commissionPct: 10,
  },
  {
    hotelId: "a2",
    name: "Radison",
    price: 5900,
    city: "delhi",
    commissionPct: 13,
  },
  {
    hotelId: "a3",
    name: "Grand Hyatt",
    price: 8500,
    city: "delhi",
    commissionPct: 15,
  },
  {
    hotelId: "a4",
    name: "Taj Palace",
    price: 12000,
    city: "delhi",
    commissionPct: 18,
  },
  {
    hotelId: "a5",
    name: "Lemon Tree",
    price: 3200,
    city: "delhi",
    commissionPct: 8,
  },
  {
    hotelId: "a6",
    name: "Novotel",
    price: 7100,
    city: "mumbai",
    commissionPct: 12,
  },
  {
    hotelId: "a7",
    name: "ITC Maratha",
    price: 9800,
    city: "mumbai",
    commissionPct: 16,
  },
];

router.get("/hotels", (req: Request, res: Response) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "city query param is required" });
  }

  const filtered = hotelsA.filter(
    (h) => h.city.toLowerCase() === (city as string).toLowerCase(),
  );

  return res.status(200).json(filtered);
});

export default router;
