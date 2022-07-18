import { Shopify } from '@shopify/shopify-api';
import { Express, NextFunction, Request, Response } from 'express';

export const applyContentSecurityPolicyMiddleware = (app: Express) => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors https://${shop} https://admin.shopify.com;`,
      );
    } else {
      res.setHeader('Content-Security-Policy', `frame-ancestors 'none';`);
    }
    next();
  });
};
