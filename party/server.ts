import type * as Party from 'partykit/server'
import { error, json, notFound, ok } from './utils/response'
import { Session } from './utils/messages'
import { generateShortId } from './utils/generate-short-id' 

export default class MakeMultiplayerMainServer implements Party.Server {
  private sessions: Session[] = []

  constructor(readonly room: Party.Room) {
    this.sessions = []
  }

  async onRequest(req: Party.Request) {
    if (req.method === 'POST') {
      let sessionExists = true
      let code = ''
      let tries = 0
      while (sessionExists) {
        if (tries > 10) break

        code = generateShortId();
        sessionExists = this.sessions.some(room => room.code === code)
        if (!sessionExists) {
          this.sessions.push({ code })
        }
        tries++
      }

      if (!code) {
        return error('Failed to generate session code')
      }

      return json({ code })
    }

    if (req.method === 'GET') {
      return json({ message: 'Hello from party server!' })
    }

    if (req.method === 'OPTIONS') {
      return ok()
    }

    return notFound()
  }
}

MakeMultiplayerMainServer satisfies Party.Worker