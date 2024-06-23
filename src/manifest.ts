import { defineManifest } from '@crxjs/vite-plugin'
//@ts-ignore
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'templates/popup.html',
    default_icon: 'img/logo-48.png',
  },
  options_page: 'templates/options.html',
  content_scripts: [
    {
      matches: ['https://letrinha.petrus.dev.br/game', 'https://www.nytimes.com/games/wordle/*'],
      js: ['src/core/contentScript/index.ts'],
      run_at: 'document_start'
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: [],
})
