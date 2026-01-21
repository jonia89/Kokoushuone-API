import { Router, Request, Response } from "express";
import { reservations } from "../db/reservationsDb";
import { Reservation } from "../models/Reservation";
import { isOverlapping } from "../utils/isOverlapping";

const reservationsRouter = Router();
let idCounter = 1;

// POST /reservations
reservationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { roomId, startTime, endTime } = req.body as {
      roomId?: number;
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

    const overlapping = reservations.find(
      (r) =>
        r.roomId === roomId &&
        isOverlapping(start, end, r.startTime, r.endTime),
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
  } catch (error) {
    return error;
  }
});

// DELETE /reservations/:id
reservationsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const index = reservations.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    reservations.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    return error;
  }
});

export default reservationsRouter;
