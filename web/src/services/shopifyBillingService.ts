import { SessionInterface, Shopify } from '@shopify/shopify-api';
import {
  AppPricingInterval,
  AppSubscriptionCreateMutationVariables,
  CurrencyCode,
  getGraphQLSdk,
} from '../graphql';

const SHOPIFY_SUBSCRIPTION_AMOUNT = '29.99';
const SHOPIFY_SUBSCRIPTION_NAME = 'Jaret Boyer Solutions';

export const getActiveSubscriptions = async (session: SessionInterface) => {
  const sdk = getGraphQLSdk(session);
  try {
    const data = await sdk.appSubscriptions();
    return data.currentAppInstallation.activeSubscriptions;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createSubscription = async (
  session: SessionInterface,
  variables: AppSubscriptionCreateMutationVariables,
) => {
  const sdk = getGraphQLSdk(session);
  try {
    const data = await sdk.appSubscriptionCreate(variables);
    if (data.appSubscriptionCreate?.confirmationUrl === undefined)
      throw new Error();
    if (data.appSubscriptionCreate.userErrors.length)
      throw data.appSubscriptionCreate.userErrors;
    return data.appSubscriptionCreate.confirmationUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const ensureActiveSubscription = async (
  session: SessionInterface,
): Promise<string | undefined> => {
  const activeSubscriptions = await getActiveSubscriptions(session);
  if (
    activeSubscriptions.find(
      (subscription) =>
        subscription.name === SHOPIFY_SUBSCRIPTION_NAME &&
        subscription.test !== (process.env.NODE_ENV === 'production'),
    )
  )
    return undefined;

  const confirmationUrl = await createSubscription(session, {
    lineItems: {
      plan: {
        appRecurringPricingDetails: {
          interval: AppPricingInterval.Every_30Days,
          price: {
            amount: SHOPIFY_SUBSCRIPTION_AMOUNT,
            currencyCode: CurrencyCode.Usd,
          },
        },
      },
    },
    name: SHOPIFY_SUBSCRIPTION_NAME,
    returnUrl: `${Shopify.Context.HOST_SCHEME}://${
      Shopify.Context.HOST_NAME
    }?shop=${session.shop}&host=${Buffer.from(`${session.shop}/admin`).toString(
      'base64',
    )}`,
    test: process.env.NODE_ENV !== 'production',
  });

  return confirmationUrl;
};
