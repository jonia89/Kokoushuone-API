import { pool } from "./connection";
import { Room } from "../models/Room";

export const createRoom = async (
  userId: number,
  name: string,
  capacity: number,
): Promise<Room> => {
  const result = await pool.query(
    "INSERT INTO rooms (user_id, name, capacity) VALUES ($1, $2, $3) RETURNING *",
    [userId, name, capacity],
  );
  const room = result.rows[0];
  return {
    id: room.id,
    userId: room.user_id,
    name: room.name,
    capacity: room.capacity,
  };
};

export const getAllRooms = async (): Promise<Room[]> => {
  const result = await pool.query("SELECT * FROM rooms");
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    capacity: row.capacity,
  }));
};

export const getRoomById = async (id: number): Promise<Room | null> => {
  const result = await pool.query("SELECT * FROM rooms WHERE id = $1", [id]);
  if (result.rows.length === 0) return null;

  const room = result.rows[0];
  return {
    id: room.id,
    userId: room.user_id,
    name: room.name,
    capacity: room.capacity,
  };
};

export const deleteRoom = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM rooms WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const roomExists = async (name: string): Promise<boolean> => {
  const result = await pool.query("SELECT 1 FROM rooms WHERE name = $1", [
    name,
  ]);
  return result.rows.length > 0;
};
