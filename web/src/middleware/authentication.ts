import { AuthQuery, Shopify } from '@shopify/shopify-api';
import { gdprTopics } from '@shopify/shopify-api/dist/webhooks/registry.js';
import { Express, Request, Response } from 'express';
import * as shopifyBillingService from '../services/shopifyBillingService';

const AUTH_PATH = '/oauth';
const AUTH_CALLBACK_PATH = '/oauth/callback';
const TOP_LEVEL_AUTH_COOKIE = 'shopify_top_level_oauth';
const TOP_LEVEL_AUTH_PATH = '/oauth/toplevel';

export const applyAuthenticationMiddleware = (app: Express) => {
  app.get(AUTH_PATH, handleAuthRequest);
  app.get(TOP_LEVEL_AUTH_PATH, handleTopLevelAuthRequest);
  app.get(AUTH_CALLBACK_PATH, handleAuthCallback);
};

const handleAuthRequest = async (req: Request, res: Response) => {
  const shop = req.query.shop as string;
  if (!shop) return res.status(500).send();
  if (!req.signedCookies[TOP_LEVEL_AUTH_COOKIE])
    return res.redirect(`${TOP_LEVEL_AUTH_PATH}?shop=${shop}`);

  const session = await Shopify.Utils.loadOfflineSession(shop);
  await authRedirect(req, res, shop, session?.isActive() ?? false);
};

const handleTopLevelAuthRequest = async (req: Request, res: Response) => {
  const shop = req.query.shop as string;
  if (!shop) return res.status(500).send();

  res.cookie(TOP_LEVEL_AUTH_COOKIE, '1', {
    signed: true,
    httpOnly: true,
    sameSite: 'strict',
  });

  res.set('Content-Type', 'text/html');

  res.send(
    topLevelAuthRedirect({
      apiKey: Shopify.Context.API_KEY,
      hostName: Shopify.Context.HOST_NAME,
      hostScheme: Shopify.Context.HOST_SCHEME,
      shop,
    }),
  );
};

const handleAuthCallback = async (req: Request, res: Response) => {
  const authQuery: AuthQuery = {
    code: req.query.code as string,
    shop: req.query.shop as string,
    host: req.query.host as string,
    state: req.query.state as string,
    timestamp: req.query.timestamp as string,
    hmac: req.query.hmac as string,
  };

  try {
    const session = await Shopify.Auth.validateAuthCallback(
      req,
      res,
      authQuery,
    );

    // the app was just installed
    if (!session.isOnline) {
      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken ?? '',
      });

      for (const topic in responses) {
        const { result, success } = responses[topic];
        // The response from registerAll will include errors for the GDPR topics.  These can be safely ignored.
        // To register the GDPR topics, please set the appropriate webhook endpoint in the
        // 'GDPR mandatory webhooks' section of 'App setup' in the Partners Dashboard.
        if (!success && !gdprTopics.includes(topic))
          console.log(
            `Failed to register ${topic} webhook for ${session.shop}: ${result}`,
          );
      }

      return await authRedirect(req, res, session.shop, true);
    }

    const confirmationUrl =
      await shopifyBillingService.ensureActiveSubscription(session);
    if (confirmationUrl) return res.redirect(confirmationUrl);

    res.redirect(`/?shop=${session.shop}&host=${authQuery.host}`);
  } catch (e) {
    console.warn(e);
    if (e instanceof Shopify.Errors.InvalidOAuthError) {
      res.status(400).send(e.message);
    } else if (
      e instanceof Shopify.Errors.CookieNotFound ||
      e instanceof Shopify.Errors.SessionNotFound
    ) {
      // This is likely because the OAuth session cookie expired before the merchant approved the request
      res.redirect(`/oauth?shop=${authQuery.shop}`);
    } else if (e instanceof Error) {
      res.status(500).send(e.message);
    } else {
      res.status(500).send(e);
    }
  }
};

const authRedirect = async (
  req: Request,
  res: Response,
  shop: string,
  isActive: boolean,
) => {
  const redirectUrl = await Shopify.Auth.beginAuth(
    req,
    res,
    shop,
    AUTH_CALLBACK_PATH,
    isActive,
  );
  res.redirect(redirectUrl);
};

const topLevelAuthRedirect = ({
  apiKey,
  hostName,
  hostScheme,
  shop,
}: {
  apiKey: string;
  hostName: string;
  hostScheme: string;
  shop: string;
}) => `
  <!DOCTYPE html>
  <html>
    <head>
      <script src="https://unpkg.com/@shopify/app-bridge@3.1.0"></script>
      <script src="https://unpkg.com/@shopify/app-bridge-utils@3.1.0"></script>

      <script>
        document.addEventListener('DOMContentLoaded', function () {
          var appBridgeUtils = window['app-bridge-utils'];

          if (appBridgeUtils.isShopifyEmbedded()) {
            var AppBridge = window['app-bridge'];
            var createApp = AppBridge.default;
            var Redirect = AppBridge.actions.Redirect;

            const app = createApp({
              apiKey: '${apiKey}',
              shopOrigin: '${shop}',
            });

            const redirect = Redirect.create(app);

            redirect.dispatch(
              Redirect.Action.REMOTE,
              '${hostScheme}://${hostName}${TOP_LEVEL_AUTH_PATH}?shop=${shop}',
            );
          } else {
            window.location.href = '${AUTH_PATH}?shop=${shop}';
          }
        });
      </script>
    </head>
    <body></body>
  </html>
`;
