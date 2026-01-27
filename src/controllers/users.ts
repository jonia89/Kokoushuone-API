import { Router, Request, Response } from "express";
import {
  createUser,
  deleteUser,
  getUserDataById,
  userExistsByName,
} from "../db/usersDb";

const usersRouter = Router();

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
    const exists = await userExistsByName(name);
    if (exists) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = await createUser(name, admin);
    res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/:id
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const userData = await getUserDataById(userId);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ ...userData.user, reservations: userData.reservations });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /users/:id
usersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default usersRouter;
