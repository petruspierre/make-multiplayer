import '../../components/overlay';

const supportedGames = [
  {
    name: 'Wordle',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    root: 'App-module_gameContainer__K_CBh',
    overlay: true
  },
  {
    name: 'Letrinha',
    url: 'https://letrinha.petrus.dev.br',
    root: 'body',
    overlay: true
  }
]

// Setup preconditions
// Share health status with the background script

console.log('Running make multiplayer script')

const url = window.location.href
const game = supportedGames.find(game => url.includes(game.url))

if (game) {
  console.log(`Game detected: ${game.name}`)
  const overlay = document.createElement('mmp-overlay')
  const rootElement = document.querySelector(game.root)

  rootElement?.appendChild(overlay)
}
