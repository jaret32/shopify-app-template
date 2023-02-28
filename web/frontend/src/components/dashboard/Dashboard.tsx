import {
  Card,
  Layout,
  Link,
  Stack,
  Text,
  TextContainer,
} from '@shopify/polaris';
import { useEffect } from 'react';
import { usePage } from '../routes';
import { ProductsCard } from './ProductsCard';

export const Dashboard = () => {
  const { setPageProps } = usePage();

  useEffect(() => {
    setPageProps({ title: 'Dashboard' });
  }, []);

  return (
    <>
      <Layout.Section>
        <Card sectioned>
          <Stack
            wrap={false}
            spacing="extraTight"
            distribution="trailing"
            alignment="center"
          >
            <Stack.Item fill>
              <TextContainer spacing="loose">
                <Text as="h1" variant="headingLg">
                  Nice work on building a Shopify app 🎉
                </Text>
                <p>
                  Your app is ready to explore! It contains everything you need
                  to get started including the{' '}
                  <Link url="https://polaris.shopify.com/" external>
                    Polaris design system
                  </Link>
                  ,{' '}
                  <Link url="https://shopify.dev/api/admin-graphql" external>
                    Shopify Admin API
                  </Link>
                  , and{' '}
                  <Link
                    url="https://shopify.dev/apps/tools/app-bridge"
                    external
                  >
                    App Bridge
                  </Link>{' '}
                  UI library and components.
                </p>
                <p>
                  Ready to go? Start populating your app with some sample
                  products to view and test in your store.{' '}
                </p>
                <p>
                  Learn more about building out your app in{' '}
                  <Link
                    url="https://shopify.dev/apps/getting-started/add-functionality"
                    external
                  >
                    this Shopify tutorial
                  </Link>{' '}
                  📚{' '}
                </p>
              </TextContainer>
            </Stack.Item>
          </Stack>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <ProductsCard />
      </Layout.Section>
    </>
  );
};
