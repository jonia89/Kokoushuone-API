import express from "express";
import reservationsRouter from "./controllers/reservations";
import roomsRouter from "./controllers/rooms";

const app = express();

app.use(express.json());
app.use("/reservations", reservationsRouter);
app.use("/rooms", roomsRouter);

export default app;
