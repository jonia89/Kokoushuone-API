const ROOMS = [
  {
    name: "Apollo",
    capacity: 8,
  },
  {
    name: "Merkurius",
    capacity: 7,
  },
  {
    name: "Zeus",
    capacity: 6,
  },
];
// 0 & 1 are overlapping
// 4 is in past
const RESERVATIONS = [
  {
    userId: 1,
    startTime: "2099-01-01T10:00:00Z",
    endTime: "2099-01-01T11:00:00Z",
  },
  {
    userId: 1,
    startTime: "2099-01-01T10:30:00Z",
    endTime: "2099-01-01T11:30:00Z",
  },
  {
    userId: 1,
    startTime: "2099-01-01T10:00:00Z",
    endTime: "2099-01-01T11:00:00Z",
  },
  {
    userId: 1,
    startTime: "2099-01-01T11:30:01Z",
    endTime: "2099-01-01T12:30:00Z",
  },
  {
    userId: 1,
    startTime: "2009-01-01T10:00:00Z",
    endTime: "2009-01-01T11:00:00Z",
  },
  {
    userId: 1,
    startTime: "2099-01-01T11:00:01Z",
    endTime: "2099-01-01T12:30:00Z",
  },
];

const USERS = [{}, {}, {}];

export { ROOMS, RESERVATIONS, USERS };
