import type * as Party from 'partykit/server'
import { json, loadPlayers, Player, playerConnected, playerDisconnected, socketMessages, SocketMessages } from './utils/messages'

export default class SessionServer implements Party.Server {
  players: Player[] = []
  playerState: Record<string, any> = {}

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

      delete this.playerState[connection.id]

      this.room.broadcast(json({
        type: socketMessages.PLAYER_STATE_UPDATED,
        payload: {
          playerState: this.playerState
        }
      }))
    }

    if (this.players.length === 0) {
      this.playerState = {}
    }
  }

  onMessage(content: string, sender: Party.Connection): void | Promise<void> {
    const message: SocketMessages = JSON.parse(content)

    console.log('Received message', message)

    switch (message.type) {
      case socketMessages.START_SESSION:
        this.room.broadcast(json({
          type: socketMessages.SESSION_STARTED
        }))
        break
      case socketMessages.END_SESSION:
        this.room.broadcast(json({
          type: socketMessages.SESSION_ENDED
        }))
        break
      case socketMessages.PLAYER_STATE_UPDATE:
        const { gameState } = message.payload
        this.playerState[sender.id] = {
          ...this.playerState[sender.id],
          ...gameState
        }

        this.room.broadcast(json({
          type: socketMessages.PLAYER_STATE_UPDATED,
          payload: {
            playerState: this.playerState
          }
        }))
        break
      case socketMessages.PLAYER_STATE_HYDRATE:
        const { playerState } = message.payload
        this.playerState = playerState
        break
    }
  }
}

SessionServer satisfies Party.Worker

