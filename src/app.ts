import express from "express";
import reservationsRouter from "./routes/reservations";

const app = express();

app.use(express.json());
app.use("/reservations", reservationsRouter);

export default app;
