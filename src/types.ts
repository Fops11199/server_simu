/**
 * Legacy types.ts — re-exports from new split type files for backward compatibility.
 * Existing component imports of '../types' or './types' will continue to work.
 * New code should import from '@/types' directly.
 */
export type { FileNode, DirNode, FSNode } from './types/filesystem';
export type { DNSRecord } from './types/network';
export type { Database, DbUser, CronJob, EmailAccount, CPanelConfig } from './types/hosting';
export type { ServiceStatus } from './types/services';
export type { TerminalLine, CommandResponse } from './types/terminal';
export type { MissionObjective, Mission } from './types/missions';
export type { SimulatorCoreState as SimulatorState } from './types/simulator';
