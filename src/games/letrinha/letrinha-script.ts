import { Player } from "party/utils/messages";
import { letrinhaEvents } from "./letrinha-events";

export enum Guess {
  WRONG = 0,
  PARTIAL = 1,
  EXACT = 2
}

export type LetrinhaGameState = {
  currentAttempt: number;
  maxAttempts: number;
  lastValues: Guess[];
  startedAt?: number;
  endedAt?: number;
}

const backgroundToGuess = (background: string): Guess => {
  switch (background) {
    case 'rgb(244, 173, 35)': return Guess.PARTIAL
    case 'rgb(39, 177, 94)': return Guess.EXACT
    default: return Guess.WRONG
  }
}

export function run() {
  console.log('Running Letrinha script')

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      setTimeout(() => retrieveGameState(), 500)
    }
  })

  const sendButton = document.querySelector('button[title="Enviar palavra"]')
  sendButton?.addEventListener('click', () => {
    setTimeout(() => retrieveGameState(), 100)
  })
}

const retrieveGameState = () => {
  let lastStateAttempt = 0;
  const groups = Array.from(document.querySelectorAll('div[class*="FieldWrapper"]'))
  
  const groupsAndFields = groups
    .map(group => {
      const fields = Array.from(group.querySelectorAll('button'))
      const fieldsValues = fields
        .filter(field => {
          const styles = getComputedStyle(field)
          return field.textContent !== '' && styles.borderWidth === '0px'
        })
        .map(field => {
          const styles = getComputedStyle(field)
          console.log('Field', field.textContent, styles.backgroundColor)
          return backgroundToGuess(styles.backgroundColor)
        })

      return fieldsValues
    })
    .filter(group => group.length > 0)

  console.log('Groups and fields', groupsAndFields)
  
  const attempt = groupsAndFields.length;
  const maxAttempts = groups.length;
  const lastValues = groupsAndFields[groupsAndFields.length - 1]

  if (attempt === lastStateAttempt) {
    return;
  }

  const gameState: LetrinhaGameState = {
    currentAttempt: attempt,
    maxAttempts: maxAttempts,
    lastValues: lastValues
  }

  if (lastValues.every(value => value === Guess.EXACT)) {
    gameState.endedAt = Date.now();
  }

  lastStateAttempt = attempt;

  window.dispatchEvent(new CustomEvent(letrinhaEvents.NEW_GUESS, {
    detail: {
      gameState
    }
  }))
}

export function getInitialState(players: Player[]) {
  const maxAttempts = Array.from(document.querySelectorAll('div[class*="FieldWrapper"]')).length

  return players.reduce((acc, player) => {
    acc[player.connectionId] = {
      currentAttempt: 0,
      maxAttempts: maxAttempts,
      lastValues: [],
      startedAt: Date.now(),
    }
    return acc;
  }, {} as Record<string, LetrinhaGameState>)
}