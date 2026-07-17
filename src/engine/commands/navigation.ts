import type { SimulatorCoreState } from '../../types/simulator';
import type { CommandResponse } from '../../types/terminal';
import { resolvePath, getNodeByPath } from '../filesystem';

export function handleNavigation(
  cmd: string,
  args: string[],
  state: SimulatorCoreState,
  onStateUpdate: (changes: Partial<SimulatorCoreState>) => void
): CommandResponse | null {
  switch (cmd) {
    case 'pwd':
      return { output: state.currentDir };

    case 'ls': {
      const showAll = args.some(a => a.match(/^-[a-z]*a/));
      const longFormat = args.some(a => a.match(/^-[a-z]*l/));
      const pathArg = args.filter(a => !a.startsWith('-'))[0] || '.';
      const targetPath = resolvePath(state.currentDir, pathArg);
      const targetNode = getNodeByPath(state.fs, targetPath);

      if (!targetNode) {
        return { output: `ls: cannot access '${pathArg}': No such file or directory`, error: true };
      }

      if (targetNode.type === 'file') {
        if (longFormat) {
          return { output: `-rwxr-xr-x 1 ${targetNode.owner} student ${targetNode.content.length} Jul 15 04:35 ${targetNode.name}` };
        }
        return { output: targetNode.name };
      }

      const lines: string[] = [];
      const children = targetNode.children;

      if (showAll && longFormat) {
        lines.push(`drwxr-xr-x 2 ${targetNode.owner} student 4096 Jul 15 04:35 .`);
        lines.push(`drwxr-xr-x 2 root student 4096 Jul 15 04:35 ..`);
      } else if (showAll) {
        lines.push('.', '..');
      }

      const sortedKeys = Object.keys(children).sort();
      for (const name of sortedKeys) {
        if (name.startsWith('.') && !showAll) continue;
        const child = children[name];
        if (longFormat) {
          const typeChar = child.type === 'dir' ? 'd' : '-';
          const perms = child.permissions === '755' ? 'rwxr-xr-x' : child.permissions === '644' ? 'rw-r--r--' : 'rwxrwxrwx';
          const size = child.type === 'file' ? child.content.length : 4096;
          lines.push(`${typeChar}${perms} 1 ${child.owner} student ${size} Jul 15 04:35 ${name}`);
        } else {
          lines.push(name);
        }
      }

      return { output: longFormat ? lines.join('\n') : lines.join('    ') };
    }

    case 'cd': {
      const pathArg = args[0] || '/home/student';
      const targetPath = resolvePath(state.currentDir, pathArg);
      const targetNode = getNodeByPath(state.fs, targetPath);

      if (!targetNode) return { output: `cd: no such file or directory: ${pathArg}`, error: true };
      if (targetNode.type !== 'dir') return { output: `cd: not a directory: ${pathArg}`, error: true };

      onStateUpdate({ currentDir: targetPath });
      return { output: '' };
    }

    default:
      return null;
  }
}
