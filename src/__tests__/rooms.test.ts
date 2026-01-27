import request from "supertest";
import app from "../app";
import { pool } from "../db/connection";
import { ROOMS, RESERVATIONS, USERS } from "./MOCK_DATA";

let defaultUserId: number;

describe("Rooms API", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM reservations");
    await pool.query("DELETE FROM rooms");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE rooms_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE reservations_id_seq RESTART WITH 1");

    // Creates default admin user
    const defaultUser = await request(app).post("/users").send(USERS[1]);
    expect(defaultUser.status).toBe(201);
    defaultUserId = defaultUser.body.id;
  });
  
  test("creates a room successfully", async () => {
    const response = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  test("no right to create room", async () => {
    const regularUser = await request(app).post("/users").send(USERS[0]);
    expect(regularUser.status).toBe(201);
    const regularUserId = regularUser.body.id;

    const response = await request(app).post("/rooms").send({
      userId: regularUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });
    expect(response.status).toBe(403);
  });

  test("rejects duplicate room", async () => {
    await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });

    const response = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: 10,
    });

    expect(response.status).toBe(409);
  });

  test("lists all rooms", async () => {
    await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });
    await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[1].name,
      capacity: ROOMS[1].capacity,
    });
    const response = await request(app).get("/rooms");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test("lists reservations of room", async () => {
    const createResponse = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });
    expect(createResponse.status).toBe(201);
    const roomId = createResponse.body.id;
    await request(app).post(`/reservations/${roomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[0].startTime,
      endTime: RESERVATIONS[0].endTime,
    });
    await request(app).post(`/reservations/${roomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[2].startTime,
      endTime: RESERVATIONS[2].endTime,
    });

    const response = await request(app).get(`/rooms/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(roomId);
    expect(response.body.roomReservations).toHaveLength(2);
  });

  test("deletes room successfully", async () => {
    const firstRoomRes = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    }); // id = 1
    const secondRoomRes = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[1].name,
      capacity: ROOMS[1].capacity,
    }); // id = 2
    const firstRoomId = firstRoomRes.body.id;
    const secondRoomId = secondRoomRes.body.id;
    await request(app).post(`/reservations/${secondRoomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[0].startTime,
      endTime: RESERVATIONS[0].endTime,
    }); // roomId = 2
    await request(app).post(`/reservations/${secondRoomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[2].startTime,
      endTime: RESERVATIONS[2].endTime,
    }); // roomId = 2
    await request(app).post(`/reservations/${firstRoomId}`).send({
      userId: defaultUserId,
      startTime: RESERVATIONS[0].startTime,
      endTime: RESERVATIONS[0].endTime,
    }); // roomId = 1

    const deleteResponse = await request(app)
      .delete(`/rooms/${secondRoomId}`)
      .send({ userId: defaultUserId });

    const result = await pool.query(
      "SELECT * FROM reservations WHERE room_id = $1",
      [firstRoomId],
    );
    expect(result.rows).toHaveLength(1);

    expect(deleteResponse.status).toBe(204);
  });

  test("no right to delete room", async () => {
    const room = await request(app).post("/rooms").send({
      userId: defaultUserId,
      name: ROOMS[0].name,
      capacity: ROOMS[0].capacity,
    });
    const roomId = room.body.id;
    const regularUser = await request(app).post("/users").send(USERS[0]);
    expect(regularUser.status).toBe(201);
    const regularUserId = regularUser.body.id;

    const deleteResponse = await request(app)
      .delete(`/rooms/${roomId}`)
      .send({ userId: regularUserId });

    expect(deleteResponse.status).toBe(403);
  });
});
