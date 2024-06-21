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

    this.room.broadcast(playerConnected(this.players), [player.connectionId])
    connection.send(loadPlayers(this.players))
  }

  async onClose(connection: Party.Connection) {
    console.log(`Connection ${connection.id} closed`)

    const player = this.players.find(player => player.connectionId === connection.id)

    if (player) {
      this.players = this.players.filter(player => player.connectionId !== connection.id)

      // If the host disconnected, assign the host role to the next player
      if (player.isHost && this.players.length > 0) {
        this.players[0].isHost = true
      }

      this.room.broadcast(playerDisconnected(this.players))
    }
  }

  onMessage(message: string, sender: Party.Connection): void | Promise<void> {
    console.log(`Connection ${sender.id} sent message: ${message}`)
  }
}

SessionServer satisfies Party.Worker

