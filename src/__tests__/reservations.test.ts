import request from "supertest";
import app from "../app";
import { rooms } from "../db/roomsDb";
import { ROOMS, RESERVATIONS } from "./MOCK_DATA";

let defaultRoomId: Number;

describe("Meeting room reservation API", () => {
  beforeEach(async () => {
    rooms.length = 0;

    // Create default room for tests
    const defaultRoom = await request(app).post("/rooms").send(ROOMS[0]);
    defaultRoomId = defaultRoom.body.id;
  });

  test("creates a reservation successfully", async () => {
    const response = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send(RESERVATIONS[0]);

    expect(response.status).toBe(201);
    expect(response.body.roomId).toBe(1);
  });

  test("rejects overlapping reservations", async () => {
    await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send(RESERVATIONS[0]);

    const response = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send(RESERVATIONS[1]);

    expect(response.status).toBe(409);
  });

  test("allows same time reservation in different rooms", async () => {
    const newRoom = await request(app).post("/rooms").send(ROOMS[2]);

    await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send(RESERVATIONS[0]);

    const response = await request(app)
      .post(`/reservations/${newRoom.body.id}`)
      .send(RESERVATIONS[2]);

    expect(response.status).toBe(201);
  });

  test("rejects reservation in the past", async () => {
    const response = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send(RESERVATIONS[4]);

    expect(response.status).toBe(400);
  });

  test("deletes reservation successfully", async () => {
    const createResponse = await request(app)
      .post(`/reservations/${defaultRoomId}`)
      .send(RESERVATIONS[0]);

    const reservationId = createResponse.body.id;

    const deleteResponse = await request(app).delete(
      `/reservations/${reservationId}`,
    );

    expect(deleteResponse.status).toBe(204);
    const room = rooms.find((r) => r.id === defaultRoomId);
    expect(room?.roomReservations).toHaveLength(0);
  });
});
