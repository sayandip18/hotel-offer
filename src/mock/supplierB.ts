import { Router, type Request, type Response } from "express";

const router = Router();

const hotelsB = [
  {
    hotelId: "b1",
    name: "Holtin",
    price: 5340,
    city: "delhi",
    commissionPct: 20,
  },
  {
    hotelId: "b2",
    name: "Radison",
    price: 6200,
    city: "delhi",
    commissionPct: 11,
  },
  {
    hotelId: "b3",
    name: "Grand Hyatt",
    price: 8100,
    city: "delhi",
    commissionPct: 14,
  },
  {
    hotelId: "b4",
    name: "Bloom Suites",
    price: 4500,
    city: "delhi",
    commissionPct: 9,
  },
  {
    hotelId: "b5",
    name: "Lemon Tree",
    price: 3500,
    city: "delhi",
    commissionPct: 10,
  },
  {
    hotelId: "b6",
    name: "Novotel",
    price: 6900,
    city: "mumbai",
    commissionPct: 13,
  },
  {
    hotelId: "b7",
    name: "Sea Princess",
    price: 5600,
    city: "mumbai",
    commissionPct: 7,
  },
];

router.get("/hotels", (req: Request, res: Response) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "city query param is required" });
  }

  const filtered = hotelsB.filter(
    (h) => h.city.toLowerCase() === (city as string).toLowerCase(),
  );

  return res.status(200).json(filtered);
});

export default router;
