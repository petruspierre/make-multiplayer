import 'lit/polyfill-support.js'

import { Overlay } from '../../components/overlay';
import { SessionProvider } from '../../socket/session-context';
import { supportedGames } from '../../games';

import '../../components/overlay'
import '../../socket/session-context'
import '../../components/ui/draggable-box'
import '../../components/ui/typography'

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
          const root = document.querySelector(':root') as HTMLElement;

          if (pickStyles.primaryFont) {
            const element = document.querySelector(pickStyles.primaryFont)
            const elementStyle = getComputedStyle(element as Element)
            root.style.setProperty('--mmp-font-primary', elementStyle.fontFamily)
          }

          if (pickStyles.primaryColor) {
            const element = document.querySelector(pickStyles.primaryColor)
            const elementStyle = getComputedStyle(element as Element)
            root.style.setProperty('--mmp-color-primary', elementStyle.backgroundColor)
          }
        }

        const rootElement = document.querySelector(root)
        sessionProvider = document.createElement('mmp-session-provider');
        rootElement?.appendChild(sessionProvider)

        rootOverlay = document.createElement('mmp-overlay')
        sessionProvider.shadowRoot!.appendChild(rootOverlay)

        console.log('Root overlay element inserted')

        return
      }
  
      time += 100
    }, 100)
  }  
}

insertOverlay()