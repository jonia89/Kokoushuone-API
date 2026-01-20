import { Router, Request, Response } from "express";
import { rooms } from "../db/roomsDb";
import { Room } from "../models/Room";

const router = Router();

// POST /rooms
router.post("/", (req: Request, res: Response) => {
  const { id, name, capacity } = req.body as Partial<Room>;

  if (!id || !name || !capacity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const exists = rooms.find(r => r.id === id);
  if (exists) {
    return res.status(409).json({ error: "Room already exists" });
  }

  const room: Room = { id, name, capacity };
  rooms.push(room);

  res.status(201).json(room);
});

// GET /rooms
router.get("/", (_req, res) => {
  res.json(rooms);
});

// GET /rooms/:id
router.get("/:id", (req, res) => {
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.json(room);
});

export default router;
