import { Reservation } from "./Reservation";

export interface Room {
  id: number;
  userId: number;
  name: string;
  capacity: number;
  roomReservations: Reservation[];
}
