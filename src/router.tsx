import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';

// Lazy-load all feature tabs — code split per route
const LabsTab        = lazy(() => import('./features/labs/LabsTab').then(m => ({ default: m.LabsTab })));
const MissionsTab    = lazy(() => import('./features/missions/MissionsTab').then(m => ({ default: m.MissionsTab })));
const DashboardTab   = lazy(() => import('./features/dashboard/DashboardTab').then(m => ({ default: m.DashboardTab })));
const TerminalTab    = lazy(() => import('./features/terminal/TerminalTab').then(m => ({ default: m.TerminalTab })));
const ProvidersHub   = lazy(() => import('./features/providers/ProviderSimulator').then(m => ({ default: m.ProviderSimulator })));

// Provider sub-routes — deeply lazy loaded
const CPanelLayout      = lazy(() => import('./features/providers/cpanel/CPanelLayout').then(m => ({ default: m.CPanelLayout })));
const ToolGrid          = lazy(() => import('./features/providers/cpanel/ToolGrid').then(m => ({ default: m.ToolGrid })));
const ZoneEditor        = lazy(() => import('./features/providers/cpanel/ZoneEditor').then(m => ({ default: m.ZoneEditor })));

const ContaboLayout     = lazy(() => import('./features/providers/contabo/ContaboLayout').then(m => ({ default: m.ContaboLayout })));
const InstanceCards     = lazy(() => import('./features/providers/contabo/InstanceCards').then(m => ({ default: m.InstanceCards })));

const AWSLayout         = lazy(() => import('./features/providers/aws/AWSLayout').then(m => ({ default: m.AWSLayout })));
const EC2Dashboard      = lazy(() => import('./features/providers/aws/EC2Dashboard').then(m => ({ default: m.EC2Dashboard })));

const DOLayout          = lazy(() => import('./features/providers/digitalocean/DOLayout').then(m => ({ default: m.DOLayout })));
const DropletList       = lazy(() => import('./features/providers/digitalocean/DropletList').then(m => ({ default: m.DropletList })));
const DropletDetail     = lazy(() => import('./features/providers/digitalocean/DropletDetail').then(m => ({ default: m.DropletDetail })));

const HostingerLayout   = lazy(() => import('./features/providers/hostinger/HostingerLayout').then(m => ({ default: m.HostingerLayout })));
const ServiceCards      = lazy(() => import('./features/providers/hostinger/ServiceCards').then(m => ({ default: m.ServiceCards })));
const HostingerVpsDetail = lazy(() => import('./features/providers/hostinger/HostingerVpsDetail').then(m => ({ default: m.HostingerVpsDetail })));

const TabFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function withSuspense(Component: React.ComponentType<any>, props?: Record<string, any>) {
  return (
    <Suspense fallback={<TabFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

import HomePage from './components/homepage/HomePage';
import { MockBrowser } from './components/simulator/MockBrowser';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/app',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/app/labs" replace /> },
      { path: 'labs', element: withSuspense(LabsTab) },
      { path: 'labs/:lessonId', element: withSuspense(LabsTab) },
      { path: 'missions', element: withSuspense(MissionsTab) },
      { path: 'missions/:missionId', element: withSuspense(MissionsTab) },
      { path: 'terminal', element: withSuspense(TerminalTab) },
      { path: 'dashboard', element: withSuspense(DashboardTab) },
      { path: 'browser', element: <MockBrowser /> },
      {
        path: 'providers',
        element: <Suspense fallback={<TabFallback />}><ProvidersHub /></Suspense>,
        children: [
          { 
            path: 'cpanel', 
            element: <Suspense fallback={<TabFallback />}><CPanelLayout /></Suspense>,
            children: [
              { index: true, element: <ToolGrid /> },
              { path: 'zone-editor', element: <ZoneEditor /> }
            ]
          },
          { 
            path: 'contabo', 
            element: <Suspense fallback={<TabFallback />}><ContaboLayout /></Suspense>,
            children: [{ index: true, element: <InstanceCards /> }]
          },
          { 
            path: 'aws', 
            element: <Suspense fallback={<TabFallback />}><AWSLayout /></Suspense>,
            children: [{ index: true, element: <EC2Dashboard /> }]
          },
          { 
            path: 'digitalocean', 
            element: <Suspense fallback={<TabFallback />}><DOLayout /></Suspense>,
            children: [
              { index: true, element: <DropletList /> },
              { path: 'droplets/:dropletId', element: <Suspense fallback={<TabFallback />}><DropletDetail /></Suspense> },
            ]
          },
          { 
            path: 'hostinger', 
            element: <Suspense fallback={<TabFallback />}><HostingerLayout /></Suspense>,
            children: [
              { index: true, element: <ServiceCards /> },
              { path: 'vps/:id', element: <Suspense fallback={<TabFallback />}><HostingerVpsDetail /></Suspense> },
            ]
          },
        ],
      },
      { path: '*', element: <Navigate to="/app/labs" replace /> },
    ],
  },
]);
