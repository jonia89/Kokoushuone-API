import { Router, Request, Response } from "express";
import { reservations } from "../db/inMemoryDb";
import { Reservation } from "../models/Reservation";
import { rooms } from "../db/roomsDb";

const router = Router();
let idCounter = 1;

function isOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}

// POST /reservations
router.post("/", (req: Request, res: Response) => {
  const { roomId, startTime, endTime } = req.body as {
    roomId?: string;
    startTime?: string;
    endTime?: string;
  };

  if (!roomId || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start >= end) {
    return res.status(400).json({
      error: "Start time must be before end time",
    });
  }

  if (start < now) {
    return res.status(400).json({
      error: "Reservation cannot be in the past",
    });
  }

  const roomExists = rooms.find((r) => r.id === roomId);
  if (!roomExists) {
    return res.status(404).json({ error: "Room does not exist" });
  }

  const overlapping = reservations.find(
    (r) =>
      r.roomId === roomId && isOverlapping(start, end, r.startTime, r.endTime),
  );

  if (overlapping) {
    return res.status(409).json({
      error: "Room already booked for this time",
    });
  }

  const reservation: Reservation = {
    id: idCounter++,
    roomId,
    startTime: start,
    endTime: end,
  };

  reservations.push(reservation);
  res.status(201).json(reservation);
});

// DELETE /reservations/:id
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = reservations.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  reservations.splice(index, 1);
  res.status(204).send();
});

// GET /rooms/:roomId/reservations
router.get("/rooms/:roomId/reservations", (req: Request, res: Response) => {
  const { roomId } = req.params;

  const roomReservations = reservations
    .filter((r) => r.roomId === roomId)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  res.json(roomReservations);
});

export default router;
