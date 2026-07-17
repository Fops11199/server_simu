import type { DirNode, FSNode, FileNode } from '../types/filesystem';

// ==========================================
// PATH RESOLUTION & NAVIGATION HELPERS
// ==========================================

export function cleanPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') { stack.pop(); }
    else { stack.push(part); }
  }
  return '/' + stack.join('/');
}

export function resolvePath(currentDir: string, targetPath: string): string {
  if (targetPath.startsWith('/')) return cleanPath(targetPath);
  return cleanPath(currentDir + '/' + targetPath);
}

export function getNodeByPath(fs: DirNode, pathStr: string): FSNode | null {
  const resolved = cleanPath(pathStr);
  if (resolved === '/') return fs;
  const parts = resolved.split('/').filter(Boolean);
  let current: FSNode = fs;
  for (const part of parts) {
    if (current.type !== 'dir') return null;
    const next = current.children[part];
    if (!next) return null;
    current = next;
  }
  return current;
}

export function getParentNodeAndName(fs: DirNode, pathStr: string): { parent: DirNode; name: string } | null {
  const resolved = cleanPath(pathStr);
  if (resolved === '/') return null;
  const parts = resolved.split('/').filter(Boolean);
  const name = parts.pop()!;
  const parentPath = '/' + parts.join('/');
  const parentNode = getNodeByPath(fs, parentPath);
  if (!parentNode || parentNode.type !== 'dir') return null;
  return { parent: parentNode, name };
}

// ==========================================
// IMMUTABLE FILESYSTEM MUTATION HELPERS
// ==========================================

export function cloneFs(node: FSNode): FSNode {
  if (node.type === 'file') return { ...node };
  const childrenClone: { [name: string]: FSNode } = {};
  for (const [key, val] of Object.entries(node.children)) {
    childrenClone[key] = cloneFs(val);
  }
  return { ...node, children: childrenClone };
}

export function setNodeInFs(fs: DirNode, pathStr: string, newNode: FSNode): DirNode {
  const resolved = cleanPath(pathStr);
  const rootClone = cloneFs(fs) as DirNode;
  if (resolved === '/') return newNode as DirNode;

  const parts = resolved.split('/').filter(Boolean);
  let current: DirNode = rootClone;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current.children[part] || current.children[part].type !== 'dir') {
      current.children[part] = {
        type: 'dir', name: part, permissions: '755', owner: 'student', children: {}
      };
    }
    current = current.children[part] as DirNode;
  }
  current.children[parts[parts.length - 1]] = newNode;
  return rootClone;
}

export function deleteNodeInFs(fs: DirNode, pathStr: string): DirNode {
  const resolved = cleanPath(pathStr);
  if (resolved === '/') return fs;
  const rootClone = cloneFs(fs) as DirNode;
  const parts = resolved.split('/').filter(Boolean);
  let current: DirNode = rootClone;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current.children[part] || current.children[part].type !== 'dir') return fs;
    current = current.children[part] as DirNode;
  }
  delete current.children[parts[parts.length - 1]];
  return rootClone;
}

export function getFileContent(fs: DirNode, pathStr: string): string | null {
  const node = getNodeByPath(fs, pathStr);
  if (!node || node.type !== 'file') return null;
  return node.content;
}

export function writeFileContent(fs: DirNode, pathStr: string, content: string, owner = 'student'): DirNode {
  const existing = getNodeByPath(fs, pathStr);
  const name = pathStr.split('/').pop()!;
  const updated: FileNode = {
    type: 'file',
    name,
    content,
    permissions: existing?.type === 'file' ? existing.permissions : '644',
    owner: existing?.type === 'file' ? existing.owner : owner,
  };
  return setNodeInFs(fs, pathStr, updated);
}
