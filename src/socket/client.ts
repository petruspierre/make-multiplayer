import PartySocket from "partysocket";

export const getSocketForSession = (room: string) => new PartySocket({
  host: import.meta.env.VITE_PARTY_KIT_HOST,
  party: 'session',
  room
})