import { Overlay } from '../../components/overlay';
import { SessionProvider } from '../../socket/session-context';

import '../../components/overlay'
import '../../socket/session-context'
import '../../games/letrinha/letrinha-overlay'
import '../../components/ui/draggable-box'

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
  pickStyles?: {
    primaryFont?: string;
  };
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
    preconditions: [
      {
        query: 'div[class*="FieldWrapper"]',
        quantity: (elementsFound) => elementsFound === 6 || elementsFound === 7,
      },
      {
        query: 'div[class*="FieldWrapper"] button',
        quantity: (elementsFound) => elementsFound === 6 * 5 || elementsFound === 7 * 6,
      },
      {
        query: 'button[title="Enviar palavra"]',
        quantity: 1
      }
    ],
    pickStyles: {
      primaryFont: 'button[title="Enviar palavra"]'
    },
    timeout: 1000
  }
]

console.log('Running make multiplayer script')

const currentUrl = window.location.href
const game = supportedGames.find(game => currentUrl.includes(game.url))
let rootOverlay: Overlay;
let sessionProvider: SessionProvider;

function insertOverlay() {
  if (game) {
    const { name, preconditions, root, timeout, pickStyles } = game

    console.log(`Game detected: ${name}`)
    console.log(`Start checking ${preconditions.length} preconditions...`)

    const rootElement = document.querySelector(root)
    sessionProvider = document.createElement('mmp-session-provider');
    rootElement?.appendChild(sessionProvider)

    rootOverlay = document.createElement('mmp-overlay')
    sessionProvider.shadowRoot!.appendChild(rootOverlay)

    console.log('Root overlay element inserted')

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

        if (pickStyles) {
          const root = document.querySelector(':root');
          console.log('Setting custom styles')

          if (root) {
            if (pickStyles.primaryFont) {
              const element = document.querySelector(pickStyles.primaryFont)
              const elementStyle = getComputedStyle(element as Element)
              console.log('Setting primary font', elementStyle.fontFamily)
              root.style.setProperty('--mmp-primary-font', elementStyle.fontFamily)
            }
          }
        }

        return
      }
  
      time += 100
    }, 100)
  }  
}

insertOverlay()