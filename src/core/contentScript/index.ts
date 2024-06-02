import '../../components/overlay'
import { Overlay, OverlayStatus } from '../../components/overlay';
import '../../games/letrinha/letrinha-overlay'
import { ChromeMessage, chromeMessages, updateStatus } from '../chromeMessages';

type Precondition = {
  query: string;
  quantity: number | ((elementsFound: number) => boolean);
}

type GameIntegration = {
  name: string;
  url: string;
  root: string;
  overlayElement?: string;
  preconditions: Precondition[];
  timeout: number;
}

const supportedGames: GameIntegration[] = [
  {
    name: 'Wordle',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    root: 'App-module_gameContainer__K_CBh',
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
let overlayRoot: Overlay;

function insertOverlay() {
  if (game) {
    const { name, overlayElement, preconditions, root, timeout } = game

    console.log(`Game detected: ${name}`)
    console.log(`Start checking ${preconditions.length} preconditions...`)

    overlayRoot = document.createElement('mmp-overlay')
    const rootElement = document.querySelector(root)
  
    rootElement?.appendChild(overlayRoot)

    console.log('Root overlay element inserted')

    chrome.runtime.sendMessage(updateStatus(OverlayStatus.CONNECTING))
    overlayRoot.status = OverlayStatus.CONNECTING

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

        console.log('All conditions met. Inserting game overlay...')
        chrome.runtime.sendMessage(updateStatus(OverlayStatus.CONNECTED))
        overlayRoot.status = OverlayStatus.CONNECTED
        if (overlayElement) {
          // Insert game overlay to root overlay
          // const gameOverlay = document.createElement(overlayElement)
          // document.querySelector(root)?.appendChild(gameOverlay)
        }

        return
      }
  
      time += 100
    }, 100)
  }  
}

// chrome.runtime.onMessage.addListener((message: ChromeMessage) => {
//   const { type, payload } = message
//   console.log('Received message', message)

//   switch (type) {
//     case chromeMessages.STATUS_CHANGE:
//       if (overlayRoot) {
//         overlayRoot.status = payload.status
//       }
//       break
//   }
// })

insertOverlay()