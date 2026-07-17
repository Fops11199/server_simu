import type { SimulatorCoreState } from './simulator';

export interface MissionObjective {
  id: string;
  text: string;
  completed: boolean;
  /** Declarative validator — called reactively when simulator state changes */
  validator: (state: SimulatorCoreState) => boolean;
}

export interface Mission {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'DNS' | 'Nginx' | 'Terminal' | 'Database' | 'SSL' | 'Firewall';
  ticketNumber: number;
  clientName: string;
  description: string;
  ticketMessage: string;
  objectives: MissionObjective[];
  xpReward: number;
  completed: boolean;
}
