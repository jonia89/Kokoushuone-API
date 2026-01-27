import { pool } from "./connection";
import { Room } from "../models/Room";
import { Reservation } from "../models/Reservation";

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

export const getRoomById = async (
  id: number,
): Promise<(Room & { roomReservations: Reservation[] }) | null> => {
  const result = await pool.query(
    `
    SELECT
      r.id AS room_id,
      r.user_id,
      r.name,
      r.capacity,
      res.id AS reservation_id,
      res.user_id AS reservation_user_id,
      res.start_time,
      res.end_time
    FROM rooms r
    LEFT JOIN reservations res ON res.room_id = r.id
    WHERE r.id = $1
    `,
    [id],
  );
  if (result.rows.length === 0) return null;

  const room: Room = {
    id: result.rows[0].room_id,
    userId: result.rows[0].user_id,
    name: result.rows[0].name,
    capacity: result.rows[0].capacity,
  };
  const roomReservations = result.rows
    .filter((r) => r.reservation_id !== null)
    .map((r) => ({
      id: r.reservation_id,
      userId: r.reservation_user_id,
      roomId: room.id,
      startTime: r.start_time,
      endTime: r.end_time,
    }));
  return { ...room, roomReservations };
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
