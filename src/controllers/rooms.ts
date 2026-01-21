import { Router, Request, Response } from "express";
import { rooms } from "../db/roomsDb";
import { reservations } from "../db/reservationsDb";
import { Room } from "../models/Room";

const roomsRouter = Router();
let idCounter = 1;

// POST /rooms
roomsRouter.post("/", (req: Request, res: Response) => {
  const { name, capacity } = req.body as {
    name?: string;
    capacity?: number;
  };

  if (!name || !capacity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const exists = rooms.find((r) => r.name === name);
  if (exists) {
    return res.status(409).json({ error: "Room already exists" });
  }

  const room: Room = {
    id: idCounter++,
    name,
    capacity,
  };
  rooms.push(room);

  res.status(201).json(room);
});

// GET /rooms
roomsRouter.get("/", (_req: Request, res: Response) => {
  res.json(rooms);
});

// GET /rooms/:id
roomsRouter.get("/:id", (req: Request, res: Response) => {
  const room = rooms.find((r) => r.id === Number(req.params.id));

  const roomReservations = reservations
    .filter((r) => r.roomId === Number(req.params.id))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json({ ...room, roomReservations });
});

// DELETE /rooms/:id
roomsRouter.delete("/:id", (req: Request, res: Response) => {
  const room = rooms.find(
    (r) =>
      r.id ===
      Number(req.params.id),
  );
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
});

export default roomsRouter;
