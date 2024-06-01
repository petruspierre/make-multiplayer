import PartySocket from "partysocket";

export const socket = new PartySocket({
  host: 'localhost:1999',
  room: 'test-room'
})