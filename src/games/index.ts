import './letrinha/letrinha-overlay';
import './conexo/conexo-overlay';

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
  pickStyles?: {
    primaryFont?: string;
    primaryColor?: string;
  };
  timeout: number;
}

export const supportedGames: GameIntegration[] = [
  {
    name: 'Letrinha',
    url: 'https://letrinha.petrus.dev.br/game',
    overlayElement: 'mmp-letrinha-overlay',
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
      primaryFont: 'button[title="Enviar palavra"]',
      primaryColor: 'body'
    },
    timeout: 1000
  }, 
  {
    name: 'Conexo',
    overlayElement: 'mmp-conexo-overlay',
    url: 'https://conexo.ws/pt/daily',
    root: 'body',
    preconditions: [
      {
        query: '.game-title',
        quantity: 1
      },
      {
        query: '.board-item ',
        quantity: 16
      }
    ],
    pickStyles: {
      primaryFont: '.game-title',
      primaryColor: 'body'
    },
    timeout: 1000
  }
]