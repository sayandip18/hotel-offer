import { Worker, NativeConnection } from "@temporalio/worker";
import { fetchSupplierA } from "./activities/fetchSupplierA";
import { fetchSupplierB } from "./activities/fetchSupplierB";
import { dedupeHotels } from "./activities/dedupeHotels";
import { saveHotelsToCache } from "../service/hotelService";

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    workflowsPath: require.resolve("./workflow/hotelWorkflow"),
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
