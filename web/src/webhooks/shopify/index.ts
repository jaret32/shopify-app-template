import { Shopify } from '@shopify/shopify-api';
import { appUninstalledHandler } from './appUninstalled';
import { customersDataRequestHandler } from './customersDataRequest';
import { customersRedactHandler } from './customersRedact';
import { shopRedactHandler } from './shopRedact';

export const addShopifyWebhookHandlers = (path: string) => {
  Shopify.Webhooks.Registry.addHandlers({
    APP_UNINSTALLED: {
      path,
      webhookHandler: appUninstalledHandler,
    },
    CUSTOMERS_DATA_REQUEST: {
      path,
      webhookHandler: customersDataRequestHandler,
    },
    CUSTOMERS_REDACT: {
      path,
      webhookHandler: customersRedactHandler,
    },
    SHOP_REDACT: {
      path,
      webhookHandler: shopRedactHandler,
    },
  });
};
