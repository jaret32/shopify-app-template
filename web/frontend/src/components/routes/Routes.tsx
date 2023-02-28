import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '../dashboard';
import { ExitIframe } from '../iframe';
import { PageLayout } from './PageLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/exitiframe" element={<ExitIframe />} />
      </Route>
    </Routes>
  );
};
