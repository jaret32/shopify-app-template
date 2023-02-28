import { Layout, Page, PageProps } from '@shopify/polaris';
import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

type ContextType = {
  pageProps: PageProps;
  setPageProps: React.Dispatch<React.SetStateAction<PageProps>>;
};

export const PageLayout = () => {
  const [pageProps, setPageProps] = useState<PageProps>({});

  return (
    <Page {...pageProps}>
      <Layout>
        <Outlet context={{ pageProps, setPageProps }} />
      </Layout>
    </Page>
  );
};

export const usePage = () => useOutletContext<ContextType>();
