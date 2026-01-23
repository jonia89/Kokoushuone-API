import { Router, Request, Response } from "express";
import { rooms } from "../db/roomsDb";
import { Reservation } from "../models/Reservation";
import { isOverlapping } from "../utils/isOverlapping";

const reservationsRouter = Router();
let idCounter = 1;

// POST /reservations
reservationsRouter.post("/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    const { userId } = req.body.userId;
    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const { startTime, endTime } = req.body as {
      startTime: Date;
      endTime: Date;
    };

    if (!startTime || !endTime) {
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

    const overlapping = room.roomReservations.some((r) =>
      isOverlapping(start, end, r.startTime, r.endTime),
    );

    if (overlapping) {
      return res.status(409).json({
        error: "Room already booked for this time",
      });
    }

    const reservation: Reservation = {
      id: idCounter++,
      userId: userId,
      startTime: start,
      endTime: end,
    };

    room.roomReservations.push(reservation);
    res.status(201).json({ ...reservation, roomId });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /reservations/:id
reservationsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const reservationId = Number(req.params.id);
    let deleted = false;
    for (const room of rooms) {
      const index = room.roomReservations.findIndex(
        (r) => r.id === reservationId,
      );
      if (index !== -1) {
        room.roomReservations.splice(index, 1);
        deleted = true;
        break;
      }
    }
    if (!deleted) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default reservationsRouter;
