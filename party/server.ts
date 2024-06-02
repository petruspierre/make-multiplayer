import type * as Party from 'partykit/server'
import { json, notFound, ok } from './utils/response'
import { generateShortId } from './utils/generate-short-id'

const partyName = 'make-multiplayer-party'

export type Player = {
  connectionId: string
  name: string
}

export default class MakeMultiplayerServer implements Party.Server {
  players: Player[] = []

  constructor(readonly room: Party.Room) { }

  async onRequest(req: Party.Request) {
    if (req.method === 'POST') {
      // const id = generateShortId();
      const id = 'ABC123'

      return json({ id })
    }

    if (req.method === 'GET') {
      return json({ message: 'Hello from party server!' })
    }

    if (req.method === 'OPTIONS') {
      return ok()
    }

    return notFound()
  }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`
    Connected:
      id: ${connection.id}
      room: ${this.room.id}
      url: ${new URL(ctx.request.url).pathname}
    `);

    this.room.broadcast('player connected', [connection.id])
  }
}

MakeMultiplayerServer satisfies Party.Worker