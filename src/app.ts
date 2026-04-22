import express from "express";
import supplierARouter from "./mock/supplierA";
import supplierBRouter from "./mock/supplierB";

const app = express();

app.use("/supplierA", supplierARouter);
app.use("/supplierB", supplierBRouter);

export default app;
