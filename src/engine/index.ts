import type { SimulatorCoreState } from '../types/simulator';
import type { CommandResponse } from '../types/terminal';
import { handleNavigation } from './commands/navigation';
import { handleFileOps } from './commands/file-ops';
import { handleEditor } from './commands/editor';
import { handleServices } from './commands/services';
import { handleNetwork } from './commands/network';
import { handleMisc } from './commands/misc';
import { resolvePath, getNodeByPath, setNodeInFs, cloneFs } from './filesystem';
import type { FileNode } from '../types/filesystem';

/**
 * Main command dispatcher. Tries each command group handler in turn.
 * Returns a CommandResponse — never throws.
 */
export function executeCommand(
  rawCommand: string,
  state: SimulatorCoreState,
  onStateUpdate: (changes: Partial<SimulatorCoreState>) => void
): CommandResponse {
  const trimmed = rawCommand.trim();
  if (!trimmed) return { output: '' };

  // Handle: echo "text" > file
  const redirectMatch = trimmed.match(/^echo\s+(.*?)\s*>\s*(.+)$/);
  if (redirectMatch) {
    return handleEchoRedirect(redirectMatch[1], redirectMatch[2], state, onStateUpdate);
  }

  const parts = trimmed.split(/\s+/);
  let cmd = parts[0].toLowerCase();
  let args = parts.slice(1);

  if (cmd === 'sudo' && args.length > 0) {
    cmd = args[0].toLowerCase();
    args = args.slice(1);
  }

  const handlers = [
    () => handleNavigation(cmd, args, state, onStateUpdate),
    () => handleFileOps(cmd, args, state, onStateUpdate),
    () => handleEditor(cmd, args, state),
    () => handleServices(cmd, args, state, onStateUpdate),
    () => handleNetwork(cmd, args, state),
    () => handleMisc(cmd, args, state),
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result !== null) return result;
  }

  return {
    output: `${cmd}: command not found. Type "help" for available commands.`,
    error: true
  };
}

/**
 * Handle: echo "content" > /path/to/file
 */
function handleEchoRedirect(
  content: string,
  filePath: string,
  state: SimulatorCoreState,
  onStateUpdate: (changes: Partial<SimulatorCoreState>) => void
): CommandResponse {
  const cleanContent = content.replace(/^['"]|['"]$/g, '');
  const targetPath = resolvePath(state.currentDir, filePath.trim());
  const existing = getNodeByPath(state.fs, targetPath);
  const name = targetPath.split('/').pop()!;

  const updatedNode: FileNode = {
    type: 'file',
    name,
    content: cleanContent,
    permissions: existing?.type === 'file' ? existing.permissions : '644',
    owner: existing?.type === 'file' ? existing.owner : 'student',
  };

  const updatedFs = setNodeInFs(state.fs, targetPath, updatedNode);
  onStateUpdate({ fs: updatedFs });
  return { output: '' };
}

// Re-export filesystem helpers for use by stores and hooks
export { getNodeByPath, setNodeInFs, deleteNodeInFs, cleanPath, resolvePath } from './filesystem';
export { parseNginxConfig } from './parsers/nginx';

