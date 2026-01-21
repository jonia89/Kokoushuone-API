import request from "supertest";
import app from "../app";
import { rooms } from "../db/roomsDb";

describe("Rooms API", () => {

  beforeEach(() => {
    rooms.length = 0;
  });

  test("creates a room successfully", async () => {
    const response = await request(app)
      .post("/rooms")
      .send({
        name: "Neuvotteluhuone Apollo",
        capacity: 8
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
  });

  test("rejects duplicate room", async () => {
    await request(app)
      .post("/rooms")
      .send({
        name: "Apollo",
        capacity: 6
      });

    const response = await request(app)
      .post("/rooms")
      .send({
        name: "Apollo",
        capacity: 10
      });

    expect(response.status).toBe(409);
  });

  test("lists all rooms", async () => {
    await request(app)
      .post("/rooms")
      .send({
        name: "Apollo",
        capacity: 8
      });

    const response = await request(app).get("/rooms");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
});
