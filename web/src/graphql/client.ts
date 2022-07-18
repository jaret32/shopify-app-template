import { SessionInterface, Shopify } from '@shopify/shopify-api';
import { GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch';
import { getSdk } from './sdk';

const SHOPIFY_AUTH_HEADER = 'X-Shopify-Access-Token';

export const getGraphQLSdk = (session: SessionInterface) => {
  const client = new GraphQLClient(
    `https://${session.shop}/admin/api/${Shopify.Context.API_VERSION}/graphql.json`,
    {
      fetch,
      headers: () => ({ [SHOPIFY_AUTH_HEADER]: session.accessToken ?? '' }),
    },
  );

  return getSdk(client);
};
