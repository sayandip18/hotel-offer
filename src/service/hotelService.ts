import { type HotelResult } from "../types/hotel";
import { getRedisClient } from "../config/redis";

const CACHE_TTL = 300;

const buildKey = (city: string) => `hotels:${city.toLowerCase()}`;

export const saveHotelsToCache = async (
  city: string,
  hotels: HotelResult[],
): Promise<void> => {
  const client = getRedisClient();
  await client.set(buildKey(city), JSON.stringify(hotels), "EX", CACHE_TTL);
  console.log(`[Redis] Saved ${hotels.length} hotels for city: ${city}`);
};

export const getHotelsFromCache = async (
  city: string,
): Promise<HotelResult[] | null> => {
  const client = getRedisClient();
  const data = await client.get(buildKey(city));
  if (!data) return null;
  console.log(`[Redis] Cache hit for city: ${city}`);
  return JSON.parse(data) as HotelResult[];
};

export const filterByPrice = (
  hotels: HotelResult[],
  min?: number,
  max?: number,
): HotelResult[] => {
  return hotels.filter((h) => {
    if (min !== undefined && h.price < min) return false;
    if (max !== undefined && h.price > max) return false;
    return true;
  });
};
