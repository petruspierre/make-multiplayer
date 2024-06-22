export const socketMessages = {
  PLAYER_CONNECTED: 'socket:player:connected',
  PLAYER_DISCONNECTED: 'socket:player:disconnected',
  LOAD_PLAYERS: 'socket:load:players',
  SESSION_STARTED: 'socket:session:started',
  PLAYER_STATE_UPDATED: 'socket:state:updated',

  START_SESSION: 'socket:session:start',
  PLAYER_STATE_UPDATE: 'socket:state:update'
}

export type SocketMessages = {
  type: string;
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

export const playerConnected = (players: Player[]) => {
  return json({
    type: socketMessages.PLAYER_CONNECTED,
    payload: {
      players
    }
  })
}

export const playerDisconnected = (players: Player[]) => {
  return json({
    type: socketMessages.PLAYER_DISCONNECTED,
    payload: {
      players
    }
  })
}

export const loadPlayers = (players: Player[]) => { 
  return json({
    type: socketMessages.LOAD_PLAYERS,
    payload: {
      players
    }
  })
}
