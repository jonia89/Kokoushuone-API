import { pool } from "./connection";
import { Reservation } from "../models/Reservation";

export const createReservation = async (
  userId: number,
  roomId: number,
  startTime: Date,
  endTime: Date,
): Promise<Reservation> => {
  const result = await pool.query(
    "INSERT INTO reservations (user_id, room_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, roomId, startTime, endTime],
  );
  const reservation = result.rows[0];
  return {
    id: reservation.id,
    userId: reservation.user_id,
    roomId: reservation.room_id,
    startTime: reservation.start_time,
    endTime: reservation.end_time,
  };
};

export const getReservationsByRoom = async (
  roomId: number,
): Promise<Reservation[]> => {
  const result = await pool.query(
    "SELECT * FROM reservations WHERE room_id = $1",
    [roomId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    roomId: row.room_id,
    startTime: row.start_time,
    endTime: row.end_time,
  }));
};

export const deleteReservation = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM reservations WHERE id = $1", [
    id,
  ]);
  return (result.rowCount ?? 0) > 0;
};

export const getOverlappingReservations = async (
  roomId: number,
  startTime: Date,
  endTime: Date,
): Promise<Reservation[]> => {
  const result = await pool.query(
    "SELECT * FROM reservations WHERE room_id = $1 AND start_time < $3 AND end_time > $2",
    [roomId, startTime, endTime],
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    roomId: row.room_id,
    startTime: row.start_time,
    endTime: row.end_time,
  }));
};
