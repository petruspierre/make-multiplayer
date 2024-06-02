import '../../games/letrinha/letrinha-overlay'

type Precondition = {
  query: string;
  quantity: number | ((elementsFound: number) => boolean);
}

type GameIntegration = {
  name: string;
  url: string;
  root: string;
  overlayElement: string;
  preconditions: Precondition[];
  timeout: number;
}

const supportedGames: GameIntegration[] = [
  {
    name: 'Wordle',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    root: 'App-module_gameContainer__K_CBh',
    overlayElement: 'mmp-wordle-overlay',
    preconditions: [],
    timeout: 1000
  },
  {
    name: 'Letrinha',
    url: 'https://letrinha.petrus.dev.br',
    root: 'body',
    overlayElement: 'mmp-letrinha-overlay',
    preconditions: [{
      query: 'styles__FieldWrapper-sc-2t4gk7-2 iMRUMe',
      quantity: (elementsFound) => elementsFound === 5 || elementsFound === 6,
    }],
    timeout: 1000
  }
]

// Setup preconditions
// Share health status with the background script

console.log('Running make multiplayer script')

const currentUrl = window.location.href
const game = supportedGames.find(game => currentUrl.includes(game.url))

function insertOverlay() {
  if (game) {
    const { name, overlayElement, preconditions, root, timeout } = game

    console.log(`Game detected: ${name}`)
    console.log(`Start checking ${preconditions.length} preconditions...`)
  
    let time = 0;
    let conditionsMet = new Map<string, boolean>()
  
    const checkPreconditions = setInterval(() => {
      if (time >= timeout) {
        console.log('Timeout reached')
        clearInterval(checkPreconditions)
        return
      }
  
      for (const precondition of preconditions) {
        const { quantity, query } = precondition
  
        const elementsFound = document.querySelectorAll(query).length
        const conditionMet = typeof quantity === 'number' ? elementsFound === quantity : quantity(elementsFound)
  
        conditionsMet.set(query, conditionMet)
      }

      if (Array.from(conditionsMet.values()).length === preconditions.length) {
        clearInterval(checkPreconditions)

        console.log('All conditions met. Inserting overlay...')
  
        const overlay = document.createElement(overlayElement)
        const rootElement = document.querySelector(root)
      
        rootElement?.appendChild(overlay)

        return
      }
  
      time += 100
    }, 100)
  }  
}

insertOverlay()