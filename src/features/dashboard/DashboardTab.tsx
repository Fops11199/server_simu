import React from 'react';
import { MetricRibbon } from './components/MetricRibbon';
import { ResourceGraph } from './components/ResourceGraph';
import { ServiceController } from './components/ServiceController';
import { PortAuditList } from './components/PortAuditList';

export const DashboardTab: React.FC = () => {
  return (
    <div className="space-y-6 h-full min-h-0 overflow-y-auto pr-1" id="dashboard-tab-container">
      {/* 1. Server Specs Ribbon */}
      <MetricRibbon />

      {/* 2. Core Resource Metrics & Animated Sparkline */}
      <ResourceGraph />

      {/* 3. Services Controller & Port Listeners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ServiceController />
        <PortAuditList />
      </div>
    </div>
  );
};
