import { Shopify } from '@shopify/shopify-api';
import { Express, NextFunction, Request, Response } from 'express';
import * as shopifyBillingService from '../services/shopifyBillingService';

const SHOPIFY_REAUTHORIZE_HEADER = 'X-Shopify-API-Request-Failure-Reauthorize';
const SHOPIFY_REAUTHORIZE_URL_HEADER =
  'X-Shopify-API-Request-Failure-Reauthorize-Url';

export const applyAuthorizationMiddleware = async (
  app: Express,
  path: string,
) => {
  app.use(path, authorizeUser);
};

const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await Shopify.Utils.loadCurrentSession(req, res);
  if (session?.isActive()) {
    try {
      const confirmationUrl =
        await shopifyBillingService.ensureActiveSubscription(session);
      if (confirmationUrl)
        return topLevelRedirection(req, res, confirmationUrl);
      return next();
    } catch (e) {
      if (
        e instanceof Shopify.Errors.HttpResponseError &&
        e.response.code === 401
      ) {
        // Re-authenticate if we get a 401 response
      } else {
        throw e;
      }
    }
  }

  if (session)
    return topLevelRedirection(req, res, `/api/auth?shop=${session.shop}`);

  const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
  if (!bearerPresent) return res.status(403).send();

  const payload = Shopify.Utils.decodeSessionToken(bearerPresent[1]);
  const shop = payload.dest.replace('https://', '');
  topLevelRedirection(req, res, `/api/auth?shop=${shop}`);
};

const topLevelRedirection = (
  req: Request,
  res: Response,
  redirectUrl: string,
) => {
  res.header(SHOPIFY_REAUTHORIZE_HEADER, '1');
  res.header(SHOPIFY_REAUTHORIZE_URL_HEADER, redirectUrl);
  res.status(403).end();
};
