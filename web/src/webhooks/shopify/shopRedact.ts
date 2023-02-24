interface ShopRedactPayload {
  shop_id: number;
  shop_domain: string;
}

/**
 * 48 hours after a store owner uninstalls your app, Shopify invokes this
 * webhook.
 *
 * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#shop-redact
 */
export const shopRedactHandler = async (
  _topic: string,
  _shop: string,
  body: string,
  _webhookId: string,
) => {
  const payload = JSON.parse(body) as ShopRedactPayload;
  // delete the shops data
};
