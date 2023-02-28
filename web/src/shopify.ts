import { ApiVersion, LogSeverity } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-01';
import { shopifyApp } from '@shopify/shopify-app-express';
import { PrismaSessionStorage } from './prisma/prismaSessionStorage';

const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.January23,
    isEmbeddedApp: true,
    logger: {
      level:
        process.env.NODE_ENV === 'production'
          ? LogSeverity.Info
          : LogSeverity.Debug,
    },
    restResources,
  },
  auth: {
    path: '/api/shopify/oauth',
    callbackPath: '/api/shopify/oauth/callback',
  },
  webhooks: {
    path: '/api/shopify/webhooks',
  },
  useOnlineTokens: true,
  sessionStorage: new PrismaSessionStorage(),
});

export default shopify;
