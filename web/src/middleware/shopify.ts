import { Shopify } from '@shopify/shopify-api';
import { Express, Request, Response } from 'express';

const processShopifyGraphQL = async (req: Request, res: Response) => {
  try {
    const response = await Shopify.Utils.graphqlProxy(req, res);
    res.status(200).send(response.body);
  } catch (e) {
    res.status(500).send(e instanceof Error ? e.message : e);
  }
};

const processShopifyWebhook = async (req: Request, res: Response) => {
  try {
    await Shopify.Webhooks.Registry.process(req, res);
    console.log(`Webhook processed, returned status code 200`);
  } catch (e) {
    console.log(`Failed to process webhook: ${e}`);
    if (!res.headersSent) {
      res.status(500).send(e instanceof Error ? e.message : e);
    }
  }
};

export const applyShopifyGraphQLMiddleware = (app: Express, path: string) => {
  app.post(path, processShopifyGraphQL);
};

export const applyShopifyWebhookMiddleware = (app: Express, path: string) => {
  app.post(path, processShopifyWebhook);
};
