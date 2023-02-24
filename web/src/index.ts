import express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import productCreator from './product-creator';
import shopify from './shopify';
import { shopifyWebhookHandlers } from './webhooks/shopify';

const PORT = parseInt(
  (process.env.BACKEND_PORT as string) || (process.env.PORT as string),
  10,
);

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot(),
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: shopifyWebhookHandlers }),
);

// All endpoints after this point will require an active session
app.use('/api/*', shopify.validateAuthenticatedSession());

app.use(express.json());

// Set up Shopify GraphQL proxy
app.post('/api/shopify/graphql', async (req, res) => {
  try {
    const response = await shopify.api.clients.graphqlProxy({
      session: res.locals.shopify.session,
      rawBody: req.body,
    });

    res.send(response.body);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

app.get('/api/products/count', async (_req, res) => {
  try {
    const countData = await shopify.api.rest.Product.count({
      session: res.locals.shopify.session,
    });
    res.status(200).send(countData);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

app.get('/api/products/create', async (_req, res) => {
  try {
    await productCreator(res.locals.shopify.session);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

app.use(express.static(STATIC_PATH, { index: false }));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.listen(PORT);
