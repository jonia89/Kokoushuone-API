import request from "supertest";
import app from "../app";
import { pool } from "../db/connection";
import { USERS, ROOMS, RESERVATIONS } from "./MOCK_DATA";

describe("Users API", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM reservations");
    await pool.query("DELETE FROM rooms");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE rooms_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE reservations_id_seq RESTART WITH 1");
  });

  test("Create user without admin rights succesfully", async () => {
    const response = await request(app).post("/users").send(USERS[0]);

    expect(response.status).toBe(201);
    expect(response.body.admin).toBe(false);
    expect(response.body.id).toBeDefined();
  });

  test("Create user with admin rights succesfully as a second user", async () => {
    const response = await request(app).post("/users").send(USERS[1]);

    expect(response.status).toBe(201);
    expect(response.body.admin).toBe(true);
    expect(response.body.id).toBeDefined();
  });

  test("Rejects duplicate user", async () => {
    await request(app).post("/users").send(USERS[0]);
    const response = await request(app)
      .post("/users")
      .send({ name: "Vesa Varaaja" });
    expect(response.status).toBe(409);
  });

  test("Lists reservations of user", async () => {
    const user = await request(app).post("/users").send(USERS[1]);
    const userId = user.body.id;
    const room = await request(app).post("/rooms").send({
      userId: userId,
      name: ROOMS[1].name,
      capacity: ROOMS[1].capacity,
    });
    const roomId = room.body.id;
    await request(app).post(`/reservations/${roomId}`).send({
      userId: userId,
      startTime: RESERVATIONS[0].startTime,
      endTime: RESERVATIONS[0].endTime,
    });
    await request(app).post(`/reservations/${roomId}`).send({
      userId: userId,
      startTime: RESERVATIONS[2].startTime,
      endTime: RESERVATIONS[2].endTime,
    });
    const response = await request(app).get(`/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body.reservations).toHaveLength(2);
    expect(response.body.id).toEqual(userId);
  });

  test("Deletes user succesfully", async () => {
    const user = await request(app).post("/users").send(USERS[0]);
    const userId = user.body.id;
    const response = await request(app).delete(`/users/${userId}`);

    expect(response.status).toBe(204);
  });
});
