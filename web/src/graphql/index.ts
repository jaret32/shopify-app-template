import { Session } from '@shopify/shopify-api';
import { GraphQLClient } from 'graphql-request';
import shopify from '../shopify';
import { getSdk } from './generated';

const SHOPIFY_AUTH_HEADER = 'X-Shopify-Access-Token';

export const getGraphQLSdk = (session: Session) => {
  const client = new GraphQLClient(
    `https://${session.shop}/admin/api/${shopify.api.config.apiVersion}/graphql.json`,
    {
      fetch,
      headers: () => ({ [SHOPIFY_AUTH_HEADER]: session.accessToken ?? '' }),
    },
  );

  return getSdk(client);
};
