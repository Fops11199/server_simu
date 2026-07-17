/**
 * LabsTabAdapter — wraps the existing LabsTab component to provide
 * navigation callbacks sourced from React Router instead of prop drilling.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LabsTab as LabsTabImpl } from '../../components/LabsTab';
import { useUIStore } from '../../stores/useUIStore';

export const LabsTab: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveProvider } = useUIStore();

  const handleSetActiveTab = (tab: string) => {
    const routeMap: Record<string, string> = {
      labs: '/app/labs',
      missions: '/app/missions',
      dashboard: '/app/dashboard',
      terminal: '/app/terminal',
      providers: '/app/providers',
    };
    navigate(routeMap[tab] ?? `/app/${tab}`);
  };

  const handleSetActiveProvider = (providerId: string) => {
    setActiveProvider(providerId as any);
    if (providerId && providerId !== 'none') {
      navigate(`/app/providers/${providerId}`);
    } else {
      navigate('/app/providers');
    }
  };

  return (
    <LabsTabImpl
      setActiveTab={handleSetActiveTab}
      setActiveProvider={handleSetActiveProvider}
    />
  );
};
