interface CustomersRedactPayload {
  shop_id: number;
  shop_domain: string;
  customer: {
    id: number;
    email: string;
    phone: string;
  };
  orders_to_redact: number[];
}

/**
 * Store owners can request that data is deleted on behalf of a customer. When
 * this happens, Shopify invokes this webhook.
 *
 * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-redact
 */
export const customersRedactHandler = async (
  _topic: string,
  _shop: string,
  body: string,
  _webhookId: string,
) => {
  const payload = JSON.parse(body) as CustomersRedactPayload;
  // delete the customers data
};
