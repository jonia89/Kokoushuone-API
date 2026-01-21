import request from "supertest";
import app from "../app";
import { reservations } from "../db/reservationsDb";
import { rooms } from "../db/roomsDb";

describe("Meeting room reservation API", () => {
  beforeEach(async () => {
    reservations.length = 0;
    rooms.length = 0;

    // Create default room for tests
    await request(app).post("/rooms").send({
      name: "Apollo",
      capacity: 8,
    });
  });

  test("creates a reservation successfully", async () => {
    const response = await request(app).post("/reservations").send({
      roomId: 1,
      startTime: "2099-01-01T10:00:00Z",
      endTime: "2099-01-01T11:00:00Z",
    });

    expect(response.status).toBe(201);
    expect(response.body.roomId).toBe(1);
  });

  test("rejects overlapping reservations", async () => {
    await request(app).post("/reservations").send({
      roomId: 1,
      startTime: "2099-01-01T10:00:00Z",
      endTime: "2099-01-01T11:00:00Z",
    });

    const response = await request(app).post("/reservations").send({
      roomId: 1,
      startTime: "2099-01-01T10:30:00Z",
      endTime: "2099-01-01T11:30:00Z",
    });

    expect(response.status).toBe(409);
  });

  test("allows same time reservation in different rooms", async () => {
    await request(app).post("/rooms").send({
      id: 2,
      name: "Zeus",
      capacity: 6,
    });

    await request(app).post("/reservations").send({
      roomId: 1,
      startTime: "2099-01-01T10:00:00Z",
      endTime: "2099-01-01T11:00:00Z",
    });

    const response = await request(app).post("/reservations").send({
      roomId: 2,
      startTime: "2099-01-01T10:00:00Z",
      endTime: "2099-01-01T11:00:00Z",
    });

    expect(response.status).toBe(201);
  });

  test("rejects reservation in the past", async () => {
    const response = await request(app).post("/reservations").send({
      roomId: 1,
      startTime: "2000-01-01T10:00:00Z",
      endTime: "2000-01-01T11:00:00Z",
    });

    expect(response.status).toBe(400);
  });

  test("deletes reservation successfully", async () => {
    const createResponse = await request(app).post("/reservations").send({
      roomId: 1,
      startTime: "2099-01-01T10:00:00Z",
      endTime: "2099-01-01T11:00:00Z",
    });

    const reservationId = createResponse.body.id;

    const deleteResponse = await request(app).delete(
      `/reservations/${reservationId}`,
    );

    expect(deleteResponse.status).toBe(204);
  });
});
