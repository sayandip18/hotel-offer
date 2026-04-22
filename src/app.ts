import express from "express";
import supplierARouter from "./mock/supplierA";
import supplierBRouter from "./mock/supplierB";
import healthRouter from "./routes/health";

const app = express();

app.use("/supplierA", supplierARouter);
app.use("/supplierB", supplierBRouter);
app.use("/health", healthRouter);

export default app;
