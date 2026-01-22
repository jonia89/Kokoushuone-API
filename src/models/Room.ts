import { Reservation } from "./Reservation";

export interface Room {
  id: number;
  name: string;
  capacity: number;
  roomReservations: Reservation[];
}
