import { GraphqlQueryError, Session } from '@shopify/shopify-api';
import { getGraphQLSdk } from './graphql';

const ADJECTIVES = [
  'autumn',
  'hidden',
  'bitter',
  'misty',
  'silent',
  'empty',
  'dry',
  'dark',
  'summer',
  'icy',
  'delicate',
  'quiet',
  'white',
  'cool',
  'spring',
  'winter',
  'patient',
  'twilight',
  'dawn',
  'crimson',
  'wispy',
  'weathered',
  'blue',
  'billowing',
  'broken',
  'cold',
  'damp',
  'falling',
  'frosty',
  'green',
  'long',
];

const NOUNS = [
  'waterfall',
  'river',
  'breeze',
  'moon',
  'rain',
  'wind',
  'sea',
  'morning',
  'snow',
  'lake',
  'sunset',
  'pine',
  'shadow',
  'leaf',
  'dawn',
  'glitter',
  'forest',
  'hill',
  'cloud',
  'meadow',
  'sun',
  'glade',
  'bird',
  'brook',
  'butterfly',
  'bush',
  'dew',
  'dust',
  'field',
  'fire',
  'flower',
];

export const DEFAULT_PRODUCTS_COUNT = 5;

export default async function productCreator(
  session: Session,
  count = DEFAULT_PRODUCTS_COUNT,
) {
  const sdk = getGraphQLSdk(session);

  try {
    for (let i = 0; i < count; i++) {
      await sdk.productCreate({
        input: {
          title: `${randomTitle()}`,
          variants: [{ price: randomPrice() }],
        },
      });
    }
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`,
      );
    } else {
      throw error;
    }
  }
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}
