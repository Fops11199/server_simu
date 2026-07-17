export interface FileNode {
  type: 'file';
  name: string;
  content: string;
  permissions: string; // e.g. "644"
  owner: string;       // e.g. "student"
}

export interface DirNode {
  type: 'dir';
  name: string;
  children: { [name: string]: FileNode | DirNode };
  permissions: string; // e.g. "755"
  owner: string;       // e.g. "student"
}

export type FSNode = FileNode | DirNode;
