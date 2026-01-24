import request from "supertest";
import app from "../app";
import { rooms } from "../db/roomsDb";
import { ROOMS, RESERVATIONS } from "./MOCK_DATA";

describe("Rooms API", () => {
  beforeEach(async () => {
    rooms.length = 0;
  });

  test("creates a room successfully", async () => {
    const response = await request(app).post("/rooms").send(ROOMS[0]);

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(1);
  });

  test("rejects duplicate room", async () => {
    await request(app).post("/rooms").send(ROOMS[0]);

    const response = await request(app).post("/rooms").send({
      name: "Apollo",
      capacity: 10,
    });

    expect(response.status).toBe(409);
  });

  test("lists all rooms", async () => {
    await request(app).post("/rooms").send(ROOMS[0]);
    const response = await request(app).get("/rooms");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("lists reservations of room", async () => {
    const createResponse = await request(app).post("/rooms").send(ROOMS[0]);
    const roomId = createResponse.body.id;
    await request(app).post(`/reservations/${roomId}`).send(RESERVATIONS[0]);
    await request(app).post(`/reservations/${roomId}`).send(RESERVATIONS[2]);

    const response = await request(app).get(`/rooms/${roomId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(roomId);
    expect(response.body.roomReservations).toHaveLength(2);
  });

  test("deletes room successfully", async () => {
    const firstRoomRes = await request(app).post("/rooms").send(ROOMS[0]); // id = 1
    const secondRoomRes = await request(app).post("/rooms").send(ROOMS[1]); // id = 2
    const firstRoomId = firstRoomRes.body.id;
    const secondRoomId = secondRoomRes.body.id;
    await request(app)
      .post(`/reservations/${secondRoomId}`)
      .send(RESERVATIONS[0]); // roomId = 2
    await request(app)
      .post(`/reservations/${secondRoomId}`)
      .send(RESERVATIONS[2]); // roomId = 2
    await request(app)
      .post(`/reservations/${firstRoomId}`)
      .send(RESERVATIONS[0]); // roomId = 1

    const deleteResponse = await request(app).delete(`/rooms/${secondRoomId}`);

    const firstRoom = rooms.find((r) => r.id === firstRoomId);
    const secondRoom = rooms.find((r) => r.id === secondRoomId);

    expect(rooms).toHaveLength(1);
    expect(deleteResponse.status).toBe(204);
  });
});
