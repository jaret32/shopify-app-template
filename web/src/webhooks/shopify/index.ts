import { DeliveryMethod } from '@shopify/shopify-api';
import { WebhookHandlersParam } from '@shopify/shopify-app-express';
import shopify from '../../shopify';
import { customersDataRequestHandler } from './customersDataRequest';
import { customersRedactHandler } from './customersRedact';
import { shopRedactHandler } from './shopRedact';

export const shopifyWebhookHandlers: WebhookHandlersParam = {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    callback: customersDataRequestHandler,
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    callback: customersRedactHandler,
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: shopify.config.webhooks.path,
    callback: shopRedactHandler,
  },
};
