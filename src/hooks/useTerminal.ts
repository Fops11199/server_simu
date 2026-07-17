import { useCallback } from 'react';
import { useSimulatorStore } from '../stores/useSimulatorStore';
import { useTerminalStore } from '../stores/useTerminalStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useMissionStore } from '../stores/useMissionStore';
import { executeCommand } from '../engine';
import { getNodeByPath } from '../engine/filesystem';
import type { FileNode } from '../types/filesystem';
import { setNodeInFs } from '../engine/filesystem';

/**
 * useTerminal — encapsulates all terminal interaction logic.
 * Components just call runCommand() and the stores update automatically.
 */
export function useTerminal() {
  const simulator = useSimulatorStore();
  const { lines, nanoFilePath, nanoContent, addLine, addLines, clearLines, openNano, closeNano, setNanoContent } = useTerminalStore();

  const runCommand = useCallback((rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return { enteringNano: null };

    // Add to history
    simulator.addHistory(trimmed);

    // Echo input line
    addLine({ type: 'input', text: `student@server01:${simulator.currentDir}$ ${trimmed}` });

    // Execute
    const response = executeCommand(trimmed, simulator, (changes) => {
      simulator.patchState(changes);
    });

    // Record to DB history if logged in
    const auth = useAuthStore.getState();
    if (auth.isLoggedIn && auth.user) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.user.id,
          sessionId: auth.sessionId,
          missionId: useMissionStore.getState().activeMissionId,
          command: trimmed,
          outcome: response.error ? 'error' : response.enteringNano ? 'info' : 'success',
        }),
      }).catch(err => console.error('Failed to log command history', err));
    }

    if (response.clear) {
      clearLines();
      return { enteringNano: null };
    }

    if (response.enteringNano) {
      const node = getNodeByPath(simulator.fs, response.enteringNano);
      const content = node?.type === 'file' ? node.content : '';
      openNano(response.enteringNano, content);
      return { enteringNano: response.enteringNano };
    }

    if (response.output) {
      // Split multi-line output into separate terminal lines
      const outputLines = response.output.split('\n');
      addLines(outputLines.map(text => ({
        type: response.error ? 'error' as const : 'output' as const,
        text,
      })));
    }

    return { enteringNano: null };
  }, [simulator, addLine, addLines, clearLines, openNano]);

  const saveNano = useCallback((content: string) => {
    if (!nanoFilePath) return;
    const fileName = nanoFilePath.split('/').pop()!;
    const existing = getNodeByPath(simulator.fs, nanoFilePath);
    const updatedFile: FileNode = {
      type: 'file',
      name: fileName,
      permissions: existing?.type === 'file' ? existing.permissions : '644',
      owner: existing?.type === 'file' ? existing.owner : 'student',
      content,
    };
    const updatedFs = setNodeInFs(simulator.fs, nanoFilePath, updatedFile);
    simulator.updateFs(updatedFs);
    addLine({ type: 'success', text: `[nano] Saved changes to ${nanoFilePath}` });
    closeNano();
  }, [nanoFilePath, simulator, addLine, closeNano]);

  const discardNano = useCallback(() => {
    addLine({ type: 'info', text: '[nano] Closed editor without saving.' });
    closeNano();
  }, [addLine, closeNano]);

  return {
    lines,
    nanoFilePath,
    nanoContent,
    setNanoContent,
    runCommand,
    saveNano,
    discardNano,
    currentDir: simulator.currentDir,
  };
}
