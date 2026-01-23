import { Router, Request, Response } from "express";
import { users } from "../db/usersDb";
import { rooms } from "../db/roomsDb";
import { createUser } from "../models/User";

const usersRouter = Router();
let idCounter = 1;

// POST /users
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, admin } = req.body as {
      name: string;
      admin: boolean;
    };

    if (!name) {
      return res.status(400).json({ error: "Name missing" });
    }
    const exists = users.find((u) => u.name === name);
    if (exists) {
      return res.status(409).json({ error: "User already exists" });
    }
    const newUser = createUser(idCounter++, name, admin);
    users.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/:id
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const userData = users.find((u) => (u.id = userId));
    const reservations = rooms.flatMap((r) =>
      r.roomReservations.filter((reservation) => reservation.userId === userId),
    );
    if (!reservations) {
      return res.status(404).json({ error: "No reservations" });
    }
    res.json({ ...userData, reservations });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /users/:id
usersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    for (const room of rooms) {
      const index = room.roomReservations.findIndex((r) => r.userId === userId);
      if (index !== -1) {
        room.roomReservations.splice(index, 1);
      }
    }
    // Poistaako kaikki käyttäjän tekemät varaukset?

    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default usersRouter;
