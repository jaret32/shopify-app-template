import { ApiVersion, Shopify } from '@shopify/shopify-api';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import { join } from 'path';
import {
  applyAuthenticationMiddleware,
  applyAuthorizationMiddleware,
  applyContentSecurityPolicyMiddleware,
  applyShopifyGraphQLMiddleware,
  applyShopifyWebhookMiddleware,
} from './middleware';
import * as shopifySessionService from './services/shopifySessionService';
import { addShopifyWebhookHandlers } from './webhooks';

const API_PATH = '/api/*';
const SHOPIFY_GRAPHQL_PATH = '/api/graphql';
const SHOPIFY_WEBHOOK_PATH = '/api/webhooks/shopify';
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || '8081',
  10,
);

// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY as string,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET as string,
  SCOPES: (process.env.SCOPES as string).split(','),
  HOST_NAME: (process.env.HOST as string).replace(/https?:\/\//, ''),
  HOST_SCHEME: (process.env.HOST as string).split('://')[0],
  API_VERSION: ApiVersion.July22,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    shopifySessionService.storeCallback,
    shopifySessionService.loadCallback,
    shopifySessionService.deleteCallback,
  ),
});

addShopifyWebhookHandlers(SHOPIFY_WEBHOOK_PATH);

export const createServer = async (
  isProd = process.env.NODE_ENV === 'production',
) => {
  const app = express();
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthenticationMiddleware(app);
  applyShopifyWebhookMiddleware(app, SHOPIFY_WEBHOOK_PATH);
  applyAuthorizationMiddleware(app, API_PATH);
  applyShopifyGraphQLMiddleware(app, SHOPIFY_GRAPHQL_PATH);
  applyContentSecurityPolicyMiddleware(app);

  if (isProd) {
    const compression = await import('compression').then(
      ({ default: fn }) => fn,
    );
    app.use(compression());
    app.use(express.static('../frontend/dist', { index: false }));
  }

  app.use('/*', async (req, res) => {
    const shop = req.query.shop as string;
    if (shop) {
      const session = await Shopify.Utils.loadOfflineSession(shop);
      if (!session?.isActive() ?? true)
        return res.redirect(`/oauth?shop=${shop}`);
    }

    const fs = await import('fs');
    const fallbackFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      'index.html',
    );
    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(fs.readFileSync(fallbackFile));
  });

  return { app };
};

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;
if (!isTest) {
  createServer().then(({ app }) => app.listen(PORT));
}
