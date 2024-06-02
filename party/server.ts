import type * as Party from 'partykit/server'
import { Message } from './utils/message'
import { notFound, ok } from './utils/response'

const partyName = 'make-multiplayer-party'

export default class MakeMultiplayerServer implements Party.Server {
  constructor(readonly room: Party.Room) { }

  async onRequest(req: Party.Request) {
    if (req.method === 'POST') {
      const payload = await req.json<{ id: string }>()
      console.log('Creating new room:', payload.id)
      return ok()
    }

    return notFound()
  }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    console.log('Connected to server:', connection.id)
  }
}