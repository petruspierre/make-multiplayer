import type * as Party from 'partykit/server'
import { loadPlayers, Player, playerConnected, playerDisconnected } from './utils/messages'

export default class SessionServer implements Party.Server {
  players: Player[] = []
  gameState: any = {}

  constructor(readonly room: Party.Room) { }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(`
    Connected:
      id: ${connection.id}
      room: ${this.room.id}
      url: ${new URL(ctx.request.url).pathname}
    `);

    const player: Player = {
      connectionId: connection.id,
      name: 'Player ' + this.players.length,
      isHost: this.players.length === 0
    }

    this.players.push(player)

    this.room.broadcast(playerConnected(player), [player.connectionId])
    connection.send(loadPlayers(this.players))
  }

  async onClose(connection: Party.Connection) {
    console.log(`Connection ${connection.id} closed`)

    const player = this.players.find(player => player.connectionId === connection.id)

    if (player) {
      this.players = this.players.filter(player => player.connectionId !== connection.id)
      this.room.broadcast(playerDisconnected(player))
    }
  }
}

SessionServer satisfies Party.Worker

