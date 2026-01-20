import express from "express";
import reservationsRouter from "./routes/reservations";
import roomsRouter from "./routes/rooms";

const app = express();

app.use(express.json());
app.use("/reservations", reservationsRouter);
app.use("/rooms", roomsRouter);

export default app;
