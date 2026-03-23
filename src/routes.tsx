import AuthLandingPage from './pages/AuthLandingPage';
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import ResultPage from './pages/ResultPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Auth',
    path: '/',
    element: <AuthLandingPage />
  },
  {
    name: 'Landing',
    path: '/landing',
    element: <LandingPage />
  },
  {
    name: 'Interview',
    path: '/interview',
    element: <InterviewPage />
  },
  {
    name: 'Result',
    path: '/result',
    element: <ResultPage />
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    name: '404',
    path: '*',
    element: <NotFound />
  }
];

export default routes;

