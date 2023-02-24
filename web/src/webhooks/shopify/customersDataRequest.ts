interface CustomersDataRequestPayload {
  shop_id: number;
  shop_domain: string;
  orders_requested: number[];
  customer: {
    id: number;
    email: string;
    phone: string;
  };
  data_request: {
    id: number;
  };
}

/**
 * Customers can request their data from a store owner. When this happens,
 * Shopify invokes this webhook.
 *
 * https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
 */
export const customersDataRequestHandler = async (
  _topic: string,
  _shop: string,
  body: string,
  _webhookId: string,
) => {
  const payload = JSON.parse(body) as CustomersDataRequestPayload;
  // provide the customers data to the store owner
};
