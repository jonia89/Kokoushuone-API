import request from "supertest";
import app from "../app";
import { rooms } from "../db/roomsDb";
import { users } from "../db/usersDb";
import { USERS } from "./MOCK_DATA";

describe("Users API", () => {
  beforeEach(async () => {
    rooms.length = 0;
    users.length = 0;
  });

  test("Create user without admin rights succesfully", async () => {
    const response = await request(app).post("/users").send(USERS[0]);

    expect(response.status).toBe(201);
    expect(response.body.admin).toBe(false);
    expect(response.body.id).toEqual(1);
  });

  test("Create user with admin rights succesfully as a second user", async () => {
    const response = await request(app).post("/users").send(USERS[1]);

    expect(response.status).toBe(201);
    expect(response.body.admin).toBe(true);
    expect(response.body.id).toEqual(2);
  });

  test("Rejects duplicate user", async () => {
    await request(app).post("/users").send(USERS[0]);
    const response = await request(app)
      .post("/users")
      .send({ name: "Vesa Varaaja" });
    expect(response.status).toBe(409);
  });
});
