import { Worker } from "@temporalio/worker";
import { fetchSupplierA } from "./activities/fetchSupplierA";
import { fetchSupplierB } from "./activities/fetchSupplierB";
import { dedupeHotels } from "./activities/dedupeHotels";
import { saveHotelsToCache } from "../service/hotelService";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows/hotelWorkflow"),
    activities: {
      fetchSupplierA,
      fetchSupplierB,
      dedupeHotels,
      saveHotelsToCache,
    },
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || "hotel-offers",
  });

  console.log("[Temporal Worker] Starting...");
  await worker.run();
}

run().catch((err) => {
  console.error("[Temporal Worker] Fatal error:", err);
  process.exit(1);
});
