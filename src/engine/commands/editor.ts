import type { SimulatorCoreState } from '../../types/simulator';
import type { CommandResponse } from '../../types/terminal';
import { resolvePath, getNodeByPath } from '../filesystem';

export function handleEditor(
  cmd: string,
  args: string[],
  state: SimulatorCoreState
): CommandResponse | null {
  switch (cmd) {
    case 'nano':
    case 'vi':
    case 'vim': {
      const pathArg = args[0];
      if (!pathArg) return { output: `${cmd}: missing file operand`, error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);

      if (node?.type === 'dir') {
        return { output: `${cmd}: cannot edit '${pathArg}': Is a directory`, error: true };
      }

      return { output: `Opening ${targetPath} in Editor...`, enteringNano: targetPath };
    }

    default:
      return null;
  }
}
