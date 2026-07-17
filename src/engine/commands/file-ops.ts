import type { SimulatorCoreState } from '../../types/simulator';
import type { CommandResponse } from '../../types/terminal';
import type { DirNode, FileNode } from '../../types/filesystem';
import { resolvePath, getNodeByPath, setNodeInFs, deleteNodeInFs, cloneFs } from '../filesystem';
import { cleanPath } from '../filesystem';

export function handleFileOps(
  cmd: string,
  args: string[],
  state: SimulatorCoreState,
  onStateUpdate: (changes: Partial<SimulatorCoreState>) => void
): CommandResponse | null {
  switch (cmd) {
    case 'mkdir': {
      const pathArg = args.filter(a => !a.startsWith('-'))[0];
      if (!pathArg) return { output: 'mkdir: missing operand', error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      if (getNodeByPath(state.fs, targetPath)) {
        return { output: `mkdir: cannot create directory '${pathArg}': File exists`, error: true };
      }

      const name = targetPath.split('/').pop()!;
      const newDir: DirNode = { type: 'dir', name, permissions: '755', owner: 'student', children: {} };
      const updatedFs = setNodeInFs(state.fs, targetPath, newDir);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    case 'touch': {
      const pathArg = args[0];
      if (!pathArg) return { output: 'touch: missing file operand', error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      if (getNodeByPath(state.fs, targetPath)) return { output: '' };

      const name = targetPath.split('/').pop()!;
      const newFile: FileNode = { type: 'file', name, permissions: '644', owner: 'student', content: '' };
      const updatedFs = setNodeInFs(state.fs, targetPath, newFile);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    case 'rm': {
      const isRecursive = args.some(a => a.match(/^-[a-z]*r/) || a === '-rf' || a === '-f');
      const pathArg = args.filter(a => !a.startsWith('-'))[0];
      if (!pathArg) return { output: 'rm: missing operand', error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);

      if (!node) {
        if (isRecursive) return { output: '' };
        return { output: `rm: cannot remove '${pathArg}': No such file or directory`, error: true };
      }
      if (node.type === 'dir' && !isRecursive) {
        return { output: `rm: cannot remove '${pathArg}': Is a directory (use -r)`, error: true };
      }

      const updatedFs = deleteNodeInFs(state.fs, targetPath);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    case 'cat': {
      const pathArg = args[0];
      if (!pathArg) return { output: 'cat: missing file operand', error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);

      if (!node) return { output: `cat: ${pathArg}: No such file or directory`, error: true };
      if (node.type === 'dir') return { output: `cat: ${pathArg}: Is a directory`, error: true };
      return { output: node.content };
    }

    case 'cp': {
      if (args.length < 2) return { output: 'cp: missing destination file operand after source', error: true };
      const [srcArg, destArg] = args;
      const srcPath = resolvePath(state.currentDir, srcArg);
      const destPath = resolvePath(state.currentDir, destArg);

      const srcNode = getNodeByPath(state.fs, srcPath);
      if (!srcNode) return { output: `cp: cannot stat '${srcArg}': No such file or directory`, error: true };
      if (srcNode.type === 'dir') return { output: `cp: omitting directory '${srcArg}'`, error: true };

      const destNode = getNodeByPath(state.fs, destPath);
      const finalDestPath = destNode?.type === 'dir'
        ? cleanPath(destPath + '/' + srcNode.name)
        : destPath;

      const copiedNode: FileNode = {
        type: 'file',
        name: finalDestPath.split('/').pop()!,
        permissions: srcNode.permissions,
        owner: 'student',
        content: srcNode.content
      };

      const updatedFs = setNodeInFs(state.fs, finalDestPath, copiedNode);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    case 'mv': {
      if (args.length < 2) return { output: 'mv: missing destination file operand after source', error: true };
      const [srcArg, destArg] = args;
      const srcPath = resolvePath(state.currentDir, srcArg);
      const destPath = resolvePath(state.currentDir, destArg);

      const srcNode = getNodeByPath(state.fs, srcPath);
      if (!srcNode) return { output: `mv: cannot stat '${srcArg}': No such file or directory`, error: true };

      const destNode = getNodeByPath(state.fs, destPath);
      const finalDestPath = destNode?.type === 'dir'
        ? cleanPath(destPath + '/' + srcNode.name)
        : destPath;

      const clonedNode = cloneFs(srcNode);
      clonedNode.name = finalDestPath.split('/').pop()!;

      let updatedFs = setNodeInFs(state.fs, finalDestPath, clonedNode);
      updatedFs = deleteNodeInFs(updatedFs, srcPath);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    case 'chmod': {
      if (args.length < 2) return { output: 'chmod: missing operand', error: true };
      const [perms, pathArg] = args;
      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);

      if (!node) return { output: `chmod: cannot access '${pathArg}': No such file or directory`, error: true };

      const resolvedPerms = perms.includes('x') || perms === '755' ? '755' : '644';
      const updatedNode = { ...node, permissions: resolvedPerms };
      const updatedFs = setNodeInFs(state.fs, targetPath, updatedNode);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    case 'grep': {
      const pattern = args[0];
      const pathArg = args[1];
      if (!pattern || !pathArg) return { output: 'Usage: grep <pattern> <file>', error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);
      if (!node) return { output: `grep: ${pathArg}: No such file or directory`, error: true };
      if (node.type === 'dir') return { output: `grep: ${pathArg}: Is a directory`, error: true };

      const matches = node.content.split('\n').filter(line => line.includes(pattern));
      return { output: matches.length > 0 ? matches.join('\n') : '' };
    }

    case 'head':
    case 'tail': {
      const nFlag = args.findIndex(a => a === '-n');
      const count = nFlag >= 0 ? parseInt(args[nFlag + 1]) || 10 : 10;
      const pathArg = args.filter(a => !a.startsWith('-'))[0];
      if (!pathArg) return { output: `${cmd}: missing file operand`, error: true };

      const targetPath = resolvePath(state.currentDir, pathArg);
      const node = getNodeByPath(state.fs, targetPath);
      if (!node) return { output: `${cmd}: ${pathArg}: No such file or directory`, error: true };
      if (node.type === 'dir') return { output: `${cmd}: ${pathArg}: Is a directory`, error: true };

      const lines = node.content.split('\n');
      const selected = cmd === 'head' ? lines.slice(0, count) : lines.slice(-count);
      return { output: selected.join('\n') };
    }

    case 'ln': {
      const isSymlink = args.some(a => a === '-s' || a === '-sf');
      const filtered = args.filter(a => !a.startsWith('-'));
      if (filtered.length < 2) return { output: 'ln: missing file operand', error: true };
      const [srcArg, destArg] = filtered;

      const srcPath = resolvePath(state.currentDir, srcArg);
      const destPath = resolvePath(state.currentDir, destArg);

      const srcNode = getNodeByPath(state.fs, srcPath);
      if (!srcNode) return { output: `ln: failed to create symbolic link '${destArg}': No such file or directory`, error: true };

      const destNode: FileNode = {
        type: 'file',
        name: destPath.split('/').pop()!,
        permissions: srcNode.permissions,
        owner: 'student',
        content: srcNode.type === 'file' ? srcNode.content : ''
      };

      const updatedFs = setNodeInFs(state.fs, destPath, destNode);
      onStateUpdate({ fs: updatedFs });
      return { output: '' };
    }

    default:
      return null;
  }
}
