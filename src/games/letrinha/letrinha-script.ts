import { letrinhaEvents } from "./letrinha-events";

enum Guess {
  WRONG = 0,
  PARTIAL = 1,
  EXACT = 2
}

export type LetrinhaGameState = {
  currentAttempt: number;
  maxAttempts: number;
  lastValues: Guess[]
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

  const guessesGrid = document.querySelector('section[class*="FieldsContainer"]')

  let lastStateAttempt = 0;

  const observer = new MutationObserver(() => {
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
            return backgroundToGuess(styles.backgroundColor)
          })
  
        return fieldsValues
      })
      .filter(group => group.length > 0)
  
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

    lastStateAttempt = attempt;

    window.dispatchEvent(new CustomEvent(letrinhaEvents.NEW_GUESS, {
      detail: {
        gameState
      }
    }))
  })
  
  observer.observe(guessesGrid!, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  })
}