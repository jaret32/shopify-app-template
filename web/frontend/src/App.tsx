import { BrowserRouter } from 'react-router-dom';

import {
  AppBridgeProvider,
  AppNavigationMenu,
  AppRoutes,
  PolarisProvider,
  QueryProvider,
} from './components';

export default function App() {
  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <AppNavigationMenu />
            <AppRoutes />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
