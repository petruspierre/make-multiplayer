import { Player } from "party/utils/messages";
import { conexoEvents } from "./conexo-events";

export type ConexoGameState = {
  currentAttempt: number;
  hintsTaken: number;
  groups: string[];
  startedAt?: number;
  endedAt?: number;
}

export function run() {
  console.log('Running Conexo script')

  const statusBarWrapper = document.querySelector('.status-bar-item-wrapper')

  const observer = new MutationObserver(() => {
    const items = Array.from(statusBarWrapper!.querySelectorAll('.status-bar-item-value'))
    const groups = Array.from(document.querySelectorAll('.board-group'))

    if(!items || items.length === 0) return

    const attempt = items[0]?.textContent
    const hints = items[1]?.textContent

    const parsedGroups = groups.map(group => {
      const styles = getComputedStyle(group)
      return styles.backgroundColor
    })

    const newState: ConexoGameState = {
      currentAttempt: Number(attempt),
      hintsTaken: Number(hints),
      groups: parsedGroups
    }

    if (parsedGroups.length === 4) {
      newState.endedAt = Date.now()
    }

    window.dispatchEvent(new CustomEvent(conexoEvents.UPDATE_STATE, {
      detail: {
        gameState: newState
      }
    }))
  })

  observer.observe(statusBarWrapper!, { childList: true, subtree: true, characterData: true })
}

export function getInitialState(players: Player[]) {
  return players.reduce((acc, player) => {
    acc[player.connectionId] = {
      currentAttempt: 0,
      hintsTaken: 0,
      groups: [],
      startedAt: Date.now()
    }

    return acc;
  }, {} as Record<string, ConexoGameState>)
}