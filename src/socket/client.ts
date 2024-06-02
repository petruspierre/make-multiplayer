import PartySocket from "partysocket";

export const getSocketForSession = (room: string) => new PartySocket({
  host: 'localhost:1999',
  party: 'session',
  room
})