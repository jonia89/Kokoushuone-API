import request from "supertest";
import app from "../app";
import { pool } from "../db/connection";
import { ROOMS, RESERVATIONS, USERS } from "./MOCK_DATA";

let defaultRoomId: number;
let defaultUserId: number;

describe("Reservations API", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM reservations");
    await pool.query("DELETE FROM rooms");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE rooms_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE reservations_id_seq RESTART WITH 1");
    // Create default room for tests
    const defaultUser = await request(app).post("/users").send(USERS[1]);
    defaultUserId = defaultUser.body.id;
    const defaultRoom = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });
    defaultRoomId = defaultRoom.body.id;
  });

  test("creates a reservation successfully", async () => {
    const response = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send({
        userId: defaultUserId,
        startTime: RESERVATIONS[0].startTime,
        endTime: RESERVATIONS[0].endTime,
      });

    expect(response.status).toBe(201);
    expect(response.body.roomId).toBe(1);
  });

  test("rejects overlapping reservations", async () => {
    await request(app).post(`/reservations/${defaultRoomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[0].startTime,
      endTime: RESERVATIONS[0].endTime,
    });

    const response = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send({
        userId: defaultUserId,
        startTime: RESERVATIONS[0].startTime,
        endTime: RESERVATIONS[0].endTime,
      });

    expect(response.status).toBe(409);
  });

  test("allows same time reservation in different rooms", async () => {
    const newRoom = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[1].name,
      capacity: ROOMS[1].capacity,
    });

    await request(app).post(`/reservations/${defaultRoomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[0].startTime,
      endTime: RESERVATIONS[0].endTime,
    });

    const response = await request(app)
      .post(`/reservations/${newRoom.body.id}`)
      .send({
        userId: defaultUserId,
        startTime: RESERVATIONS[0].startTime,
        endTime: RESERVATIONS[0].endTime,
      });

    expect(response.status).toBe(201);
  });

  test("rejects reservation in the past", async () => {
    const response = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send({
        userId: defaultUserId,
        startTime: RESERVATIONS[3].startTime,
        endTime: RESERVATIONS[3].endTime,
      });

    expect(response.status).toBe(400);
  });

  test("deletes reservation successfully", async () => {
    const createResponse = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send({
        userId: defaultUserId,
        startTime: RESERVATIONS[0].startTime,
        endTime: RESERVATIONS[0].endTime,
      });

    const reservationId = createResponse.body.id;

    const deleteResponse = await request(app).delete(
      `/reservations/${reservationId}`,
    );

    expect(deleteResponse.status).toBe(204);
    const result = await pool.query(
      "SELECT * FROM reservations WHERE room_id = $1",
      [defaultRoomId],
    );
    expect(result.rows).toHaveLength(0);
  });
});
