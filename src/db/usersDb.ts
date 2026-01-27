import { pool } from "./connection";
import { User } from "../models/User";
import { Reservation } from "../models/Reservation";

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  return {
    id: user.id,
    name: user.name,
    admin: user.admin,
  };
};
export const getUsersReservations = async (
  id: number,
): Promise<Reservation[]> => {
  const result = await pool.query(
    "SELECT * FROM reservations WHERE user_id = $1",
    [id],
  );
  if (result.rows.length === 0) return [];

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    roomId: row.room_id,
    startTime: row.start_time,
    endTime: row.end_time,
  }));
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
