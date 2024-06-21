export const socketMessages = {
  PLAYER_CONNECTED: 'player:connected',
  PLAYER_DISCONNECTED: 'player:disconnected',
  LOAD_PLAYERS: 'load:players',
}

export type SocketMessages = {
  type: keyof typeof socketMessages;
  payload: any;
}

export type Player = {
  connectionId: string
  name: string
  isHost: boolean
}

export type Session = {
  code: string
}

export const json = (data: any) => {
  return JSON.stringify(data)
}

export const playerConnected = (player: Player) => {
  return json({
    type: socketMessages.PLAYER_CONNECTED,
    payload: player
  })
}

export const playerDisconnected = (player: Player) => {
  return json({
    type: socketMessages.PLAYER_DISCONNECTED,
    payload: player
  })
}

export const loadPlayers = (players: Player[]) => { 
  return json({
    type: socketMessages.LOAD_PLAYERS,
    payload: players
  })
}
