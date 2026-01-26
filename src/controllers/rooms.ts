import { Router, Request, Response } from "express";
import {
  createRoom,
  roomExists,
  getAllRooms,
  getRoomById,
  deleteRoom,
} from "../db/roomsDb";
import { getUserById } from "../db/usersDb";
import { isAdmin } from "../utils/isAdmin";

const roomsRouter = Router();

// POST /rooms
roomsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, name, capacity } = req.body as {
      userId: number;
      name: string;
      capacity: number;
    };
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: "No rights to add room" });
    }

    if (userId == null || typeof userId !== "number") {
      return res.status(400).json({ error: "Valid userId is required" });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Valid name is required" });
    }
    if (!capacity || typeof capacity !== "number" || capacity <= 0) {
      return res.status(400).json({ error: "Valid capacity is required" });
    }

    const exists = await roomExists(name);
    if (exists) {
      return res.status(409).json({ error: "Room already exists" });
    }

    const newRoom = await createRoom(userId, name, capacity);
    res.status(201).json(newRoom);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /rooms
roomsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const rooms = await getAllRooms();
    res.json(rooms);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /rooms/:id
roomsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const room = await getRoomById(Number(req.params.id));

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /rooms/:id
roomsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId: number };

    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: "No rights to delete room" });
    }

    if (userId == null || typeof userId !== "number") {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const roomId = Number(req.params.id);
    if (isNaN(roomId)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    const deleted = await deleteRoom(roomId);

    if (!deleted) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default roomsRouter;
