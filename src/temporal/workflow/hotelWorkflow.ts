import { proxyActivities } from "@temporalio/workflow";
import type { fetchSupplierA } from "../activities/fetchSupplierA";
import type { fetchSupplierB } from "../activities/fetchSupplierB";
import type { dedupeHotels } from "../activities/dedupeHotels";
import type { saveHotelsToCache } from "../../service/hotelService";

const activities = proxyActivities<{
  fetchSupplierA: typeof fetchSupplierA;
  fetchSupplierB: typeof fetchSupplierB;
  dedupeHotels: typeof dedupeHotels;
  saveHotelsToCache: typeof saveHotelsToCache;
}>({
  startToCloseTimeout: "10 seconds",
  retry: {
    maximumAttempts: 2,
  },
});

export async function hotelWorkflow(city: string) {
  const [supplierAHotels, supplierBHotels] = await Promise.all([
    activities.fetchSupplierA(city),
    activities.fetchSupplierB(city),
  ]);

  // Deduplicate and pick best choice
  const dedupedHotels = await activities.dedupeHotels(
    supplierAHotels,
    supplierBHotels,
  );

  // Save to Redis
  await activities.saveHotelsToCache(city, dedupedHotels);

  return dedupedHotels;
}
