import { Client, Connection } from "@temporalio/client";

let temporalClient: Client | null = null;

export const getTemporalClient = async (): Promise<Client> => {
  if (temporalClient) return temporalClient;

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  temporalClient = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
  });

  console.log("[Temporal] Client connected");
  return temporalClient;
};
