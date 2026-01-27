import { Router, Request, Response } from "express";
import {
  createReservation,
  deleteReservation,
  getOverlappingReservations,
} from "../db/reservationsDb";
import { getRoomById } from "../db/roomsDb";

const reservationsRouter = Router();

// POST /reservations
reservationsRouter.post("/:roomId", async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    if (isNaN(roomId)) {
      return res.status(400).json({ error: "Invalid room ID" });
    }

    const room = await getRoomById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const { userId, startTime, endTime } = req.body as {
      userId: number;
      startTime: Date;
      endTime: Date;
    };
    if (userId == null || typeof userId !== "number") {
      return res.status(400).json({ error: "Valid userId is required" });
    }

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

    const overlapping = await getOverlappingReservations(roomId, start, end);

    if (overlapping.length > 0) {
      return res.status(409).json({
        error: "Room already booked for this time",
      });
    }

    const reservation = await createReservation(userId, roomId, start, end);
    res.status(201).json(reservation);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /reservations/:id
reservationsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const reservationId = Number(req.params.id);
    if (isNaN(reservationId)) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }
    const deleted = await deleteReservation(reservationId);

    if (!deleted) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default reservationsRouter;
