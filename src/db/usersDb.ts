import { pool } from "./connection";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";

export const getUserDataById = async (
  id: number,
): Promise<{ user: User; reservations: Reservation[] } | null> => {
  const result = await pool.query(
    `
    SELECT
      u.id AS user_id,
      u.name,
      u.admin,
      r.id AS reservation_id,
      r.room_id,
      r.start_time,
      r.end_time
    FROM users u
    LEFT JOIN reservations r ON r.user_id = u.id
    WHERE u.id = $1
    `,
    [id],
  );
  if (result.rows.length === 0) return null;

  const user: User = {
    id: result.rows[0].user_id,
    name: result.rows[0].name,
    admin: result.rows[0].admin,
  };
  const reservations = result.rows
    .filter((r) => r.reservation_id !== null)
    .map((r) => ({
      id: r.reservation_id,
      userId: r.user_id,
      roomId: r.room_id,
      startTime: r.start_time,
      endTime: r.end_time,
    }));
  return { user, reservations };
};

export const createUser = async (
  name: string,
  admin: boolean = false,
): Promise<User> => {
  const result = await pool.query(
    "INSERT INTO users (name, admin) VALUES ($1, $2) RETURNING *",
    [name, admin],
  );
  const user = result.rows[0];
  return {
    id: user.id,
    name: user.name,
    admin: user.admin,
  };
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const userExistsByName = async (name: string): Promise<boolean> => {
  const result = await pool.query("SELECT 1 FROM users WHERE name = $1", [
    name,
  ]);
  return result.rows.length > 0;
};
