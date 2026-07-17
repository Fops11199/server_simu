import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { DNSRecord, Database, DbUser, CronJob, FSNode, FileNode, DirNode } from '../types';
import { 
  Folder, FileCode, ArrowLeft, Plus, Trash2, ShieldCheck, ShieldAlert,
  Server, Network, Database as DbIcon, Shield, Globe, Clock, RefreshCw, Edit3, Save, X, Eye, EyeOff
} from 'lucide-react';
import { getNodeByPath, setNodeInFs, deleteNodeInFs, cleanPath } from '../lib/simulatorEngine';
import { useUIStore } from '../stores/useUIStore';

const CompanionHelp: React.FC<{ text: string }> = ({ text }) => {
  const { companionOpen } = useUIStore();
  if (!companionOpen) return null;
  return (
    <span className="relative group cursor-help inline-block ml-1.5 shrink-0 select-none normal-case font-sans">
      <span className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold flex items-center justify-center animate-pulse">
        ?
      </span>
      <span className="absolute z-[999] hidden group-hover:block w-52 p-2.5 bg-slate-950 border border-yellow-500/30 text-slate-350 text-[10px] rounded-lg shadow-2xl leading-normal bottom-full mb-2 left-1/2 -translate-x-1/2">
        {text}
        <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-yellow-500/30 rotate-45"></span>
      </span>
    </span>
  );
};

type SubSection = 'file_manager' | 'dns_editor' | 'databases' | 'ssl' | 'domains' | 'cron';

export const CPanelTab: React.FC = () => {
  const [activeSub, setActiveSub] = useState<SubSection>('file_manager');

  const menuItems = [
    { id: 'file_manager', label: 'File Manager', icon: <Folder className="w-4 h-4" /> },
    { id: 'dns_editor', label: 'DNS Zone Editor', icon: <Network className="w-4 h-4" /> },
    { id: 'databases', label: 'Databases (Postgres)', icon: <DbIcon className="w-4 h-4" /> },
    { id: 'ssl', label: 'SSL/TLS Manager', icon: <Shield className="w-4 h-4" /> },
    { id: 'domains', label: 'Domains & Subdomains', icon: <Globe className="w-4 h-4" /> },
    { id: 'cron', label: 'Cron Jobs Scheduler', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0" id="cpanel-container">
      {/* cPanel Left Menu Sidebar */}
      <div className="lg:w-60 shrink-0 bg-[#0c0d12] border border-white/5 rounded-xl p-4 flex flex-col gap-1.5 select-none shadow-xl">
        <div className="px-2 py-4 border-b border-white/10 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#ff6c2c] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-orange-500/20 tracking-wider">
            cP
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-sans leading-none">
              cPanel
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-1">v118.0.4 Web Interface</p>
          </div>
        </div>

        {menuItems.map((item) => {
          const isActive = activeSub === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSub(item.id as SubSection)}
              className={`w-full text-left flex items-center justify-between px-3.5 py-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-[#ff6c2c]/15 border-[#ff6c2c]/40 text-[#ff8046] shadow-md shadow-[#ff6c2c]/5'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-sans">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* cPanel Main Workspace Panel */}
      <div className="flex-1 bg-[#0d0d12]/60 border border-white/5 rounded-xl overflow-hidden flex flex-col h-full min-h-0 min-w-0">
        <div className="p-4 bg-[#050507]/40 border-b border-white/5 flex justify-between items-center select-none shrink-0">
          <h3 className="font-semibold text-slate-100 font-sans tracking-tight">
            {menuItems.find(m => m.id === activeSub)?.label}
          </h3>
          <span className="text-xs text-slate-500 font-mono">HostLab Shared Kernel v1.0</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 min-h-0 min-w-0">
          {activeSub === 'file_manager' && <FileManagerView />}
          {activeSub === 'dns_editor' && <DnsEditorView />}
          {activeSub === 'databases' && <DatabasesView />}
          {activeSub === 'ssl' && <SslManagerView />}
          {activeSub === 'domains' && <SubdomainsView />}
          {activeSub === 'cron' && <CronJobsView />}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. FILE MANAGER VIEW
// ==========================================

const FileManagerView: React.FC = () => {
  const { state, updateState, addTerminalLine } = useSimulator();
  const [currentPath, setCurrentPath] = useState<string>('/home/student');
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isFolder, setIsFolder] = useState(false);

  const currentNode = getNodeByPath(state.fs, currentPath);
  
  if (!currentNode || currentNode.type !== 'dir') {
    return <div className="text-red-400">Path error: Current folder does not exist.</div>;
  }

  const handleNavigate = (name: string) => {
    const nextPath = cleanPath(currentPath + '/' + name);
    const node = getNodeByPath(state.fs, nextPath);
    if (node && node.type === 'dir') {
      setCurrentPath(nextPath);
    }
  };

  const handleGoBack = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const openCodeEditor = (fileName: string, fileNode: FileNode) => {
    setEditingFile({
      path: cleanPath(currentPath + '/' + fileName),
      content: fileNode.content
    });
  };

  const handleSaveFile = () => {
    if (!editingFile) return;
    const fileName = editingFile.path.split('/').pop()!;
    const newFile: FileNode = {
      type: 'file',
      name: fileName,
      permissions: '644',
      owner: 'student',
      content: editingFile.content
    };
    const updatedFs = setNodeInFs(state.fs, editingFile.path, newFile);
    updateState({ fs: updatedFs });

    // Sync with terminal
    addTerminalLine({ type: 'success', text: `[cPanel FileManager] Saved file: ${editingFile.path}` });
    setEditingFile(null);
  };

  const handleDeleteNode = (name: string) => {
    const targetPath = cleanPath(currentPath + '/' + name);
    const updatedFs = deleteNodeInFs(state.fs, targetPath);
    updateState({ fs: updatedFs });
    addTerminalLine({ type: 'info', text: `[cPanel FileManager] Deleted: ${targetPath}` });
  };

  const handleCreateNode = () => {
    if (!newFileName.trim()) return;
    const targetPath = cleanPath(currentPath + '/' + newFileName.trim());
    
    if (isFolder) {
      const newDir: DirNode = {
        type: 'dir',
        name: newFileName.trim(),
        permissions: '755',
        owner: 'student',
        children: {}
      };
      const updatedFs = setNodeInFs(state.fs, targetPath, newDir);
      updateState({ fs: updatedFs });
      addTerminalLine({ type: 'success', text: `[cPanel FileManager] Created folder: ${targetPath}` });
    } else {
      const newFile: FileNode = {
        type: 'file',
        name: newFileName.trim(),
        permissions: '644',
        owner: 'student',
        content: ''
      };
      const updatedFs = setNodeInFs(state.fs, targetPath, newFile);
      updateState({ fs: updatedFs });
      addTerminalLine({ type: 'success', text: `[cPanel FileManager] Created file: ${targetPath}` });
    }
    
    setNewFileName('');
    setShowNewFileModal(false);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* File Manager Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#050507] p-3 rounded-lg border border-white/5">
        <div className="flex items-center gap-2 text-slate-350 truncate">
          <button
            onClick={handleGoBack}
            disabled={currentPath === '/'}
            className="p-1.5 hover:bg-white/5 rounded disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold select-all text-slate-100 shrink-0">Path:</span>
          <span className="bg-[#15151a] px-2.5 py-1 rounded border border-white/5 select-all font-semibold font-mono truncate max-w-[280px]">
            {currentPath}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsFolder(false); setShowNewFileModal(true); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 cursor-pointer transition-colors shadow-glow-cyan/10"
          >
            <Plus className="w-3.5 h-3.5" /> New File
          </button>
          <button
            onClick={() => { setIsFolder(true); setShowNewFileModal(true); }}
            className="bg-[#15151a] hover:bg-[#20202a] text-slate-350 font-sans font-semibold px-3 py-1.5 rounded inline-flex items-center gap-1 border border-white/5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Folder
          </button>
        </div>
      </div>

      {/* Directory Content List */}
      <div className="bg-[#050507] border border-white/5 rounded-lg overflow-hidden divide-y divide-white/5 max-h-[380px] overflow-y-auto">
        {/* Row for navigating up */}
        {currentPath !== '/' && (
          <div
            onDoubleClick={handleGoBack}
            className="flex items-center p-3 hover:bg-white/5 cursor-pointer select-none text-slate-500 font-bold"
          >
            <Folder className="w-4 h-4 mr-3 text-slate-500" />
            <span>.. (Parent Directory)</span>
          </div>
        )}

        {currentNode.children && Object.keys(currentNode.children).length === 0 ? (
          <div className="p-8 text-center text-slate-650 italic font-sans select-none">
            This directory is completely empty.
          </div>
        ) : (
          currentNode.children && Object.entries(currentNode.children).map(([name, node]) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 hover:bg-white/5 select-none group"
            >
              <div
                className="flex-1 flex items-center cursor-pointer min-w-0"
                onClick={() => node.type === 'dir' ? handleNavigate(name) : openCodeEditor(name, node as FileNode)}
              >
                {node.type === 'dir' ? (
                  <Folder className="w-4 h-4 text-amber-400 shrink-0 mr-3" />
                ) : (
                  <FileCode className="w-4 h-4 text-blue-400 shrink-0 mr-3" />
                )}
                <span className="font-medium text-slate-200 truncate pr-4">{name}</span>
                <span className="text-[10px] text-slate-500 shrink-0 font-normal">
                  {node.owner} • {node.permissions}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {node.type === 'file' && (
                  <button
                    onClick={() => openCodeEditor(name, node as FileNode)}
                    className="p-1 hover:bg-[#15151a] rounded text-slate-400 hover:text-slate-250 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Edit File"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNode(name)}
                  className="p-1 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-450 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Code Editor Modal Overlay */}
      {editingFile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d0d12] border border-white/5 rounded-xl w-full max-w-3xl flex flex-col h-[520px] overflow-hidden shadow-glow-indigo/10">
            <div className="p-4 bg-[#050507] border-b border-white/5 flex justify-between items-center shrink-0 select-none">
              <span className="font-semibold text-slate-100 font-mono text-sm truncate max-w-[450px]">
                cPanel CodeEditor: {editingFile.path}
              </span>
              <button onClick={() => setEditingFile(null)} className="text-slate-500 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={editingFile.content}
              onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
              className="flex-1 bg-[#050507] text-slate-200 font-mono text-sm leading-relaxed p-4 focus:outline-none overflow-y-auto focus:ring-1 focus:ring-indigo-500/30"
              style={{ tabSize: 4 }}
              spellCheck="false"
            />

            <div className="p-3 bg-[#050507] border-t border-white/5 flex justify-end gap-2 shrink-0 select-none">
              <button
                onClick={() => setEditingFile(null)}
                className="bg-[#15151a] hover:bg-[#20202a] border border-white/5 text-slate-350 px-4 py-2 rounded font-sans font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-sans font-semibold flex items-center gap-1.5 cursor-pointer shadow-glow-indigo/15"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-[#0d0d12] border border-white/5 rounded-xl w-full max-w-sm overflow-hidden shadow-glow-indigo/10">
            <div className="p-4 bg-[#050507] border-b border-white/5 font-semibold text-slate-200 flex justify-between items-center">
              <span>Create New {isFolder ? 'Folder' : 'File'}</span>
              <button onClick={() => setShowNewFileModal(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder={isFolder ? 'my_folder' : 'index.html'}
                  className="w-full bg-[#050507] border border-white/5 rounded p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500/50 font-mono"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-3 bg-[#050507] border-t border-white/5 flex justify-end gap-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="bg-[#15151a] text-slate-300 hover:bg-[#20202a] border border-white/5 px-3 py-1.5 rounded font-sans cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNode}
                className="bg-cyan-600 text-white px-3.5 py-1.5 rounded hover:bg-cyan-500 font-sans cursor-pointer font-semibold shadow-glow-cyan/10"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. DNS ZONE EDITOR VIEW
// ==========================================

const DnsEditorView: React.FC = () => {
  const { state, addDnsRecord, deleteDnsRecord, addTerminalLine } = useSimulator();
  const [name, setName] = useState('');
  const [type, setType] = useState<'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS'>('A');
  const [value, setValue] = useState('');
  const [ttl, setTtl] = useState(3600);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;

    addDnsRecord({
      name: name.trim(),
      type,
      value: value.trim(),
      ttl: Number(ttl)
    });

    addTerminalLine({ type: 'success', text: `[cPanel DNS] Added ${type} Record for ${name} -> ${value}` });
    setName('');
    setValue('');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* DNS Record Adder Form */}
      <form onSubmit={handleAdd} className="bg-[#050507] border border-white/5 rounded-lg p-4 space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" /> Add New DNS Zone Record
          <CompanionHelp text="A record maps host to IP. CNAME creates aliases. MX record defines mail exchangers, e.g. mail.domain.local with preference." />
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name / Host</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="api.hostlab.local"
              className="w-full bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer text-xs"
            >
              <option value="A">A (IP)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="CNAME">CNAME (Alias)</option>
              <option value="MX">MX (Mail)</option>
              <option value="TXT">TXT (Text)</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Value / Destination</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="203.0.113.10"
              className="w-full bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold py-2 px-3 rounded inline-flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-glow-indigo/15"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </form>

      {/* DNS Records Grid Table */}
      <div className="bg-[#050507] border border-white/5 rounded-lg overflow-hidden shadow-glow-indigo/2">
        <div className="p-3 bg-[#0d0d12] border-b border-white/5 flex justify-between items-center select-none">
          <span className="font-semibold text-slate-300">Active Zone Records: hostlab.local</span>
          <span className="text-[10px] text-slate-500 font-mono">Query Engine: dig-compatible</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-white/5">
            <thead className="bg-[#050507]/60 text-slate-400 select-none text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
              <tr>
                <th className="p-3">Host Domain</th>
                <th className="p-3">TTL</th>
                <th className="p-3">Type</th>
                <th className="p-3">Destination IP/Alias</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {state.dnsRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-semibold text-slate-200 truncate max-w-[150px]">{rec.name}</td>
                  <td className="p-3 text-slate-400">{rec.ttl}</td>
                  <td className="p-3">
                    <span className="bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/15 px-1.5 py-0.5 rounded text-[10px]">
                      {rec.type}
                    </span>
                  </td>
                  <td className="p-3 select-all font-semibold text-slate-100 truncate max-w-[200px]">{rec.value}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        deleteDnsRecord(rec.id);
                        addTerminalLine({ type: 'info', text: `[cPanel DNS] Removed DNS Record ID: ${rec.id} (${rec.name})` });
                      }}
                      className="p-1 hover:bg-red-500/10 text-slate-450 hover:text-red-400 rounded transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. DATABASE MANAGER VIEW (POSTGRESQL)
// ==========================================

const DatabasesView: React.FC = () => {
  const { state, createDatabase, createDatabaseUser, assignUserToDatabase, addTerminalLine } = useSimulator();
  const [dbName, setDbName] = useState('');
  const [username, setUsername] = useState('');
  
  const [selectedDbId, setSelectedDbId] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const handleCreateDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbName.trim()) return;
    createDatabase(dbName.trim());
    addTerminalLine({ type: 'success', text: `[cPanel DB] Created database: ${dbName.trim()}` });
    setDbName('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    createDatabaseUser(username.trim());
    addTerminalLine({ type: 'success', text: `[cPanel DB] Created db-user: ${username.trim()}` });
    setUsername('');
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDbId || !selectedUser) return;
    assignUserToDatabase(selectedDbId, selectedUser);
    
    const db = state.cpanel.databases.find(d => d.id === selectedDbId);
    addTerminalLine({ type: 'success', text: `[cPanel DB] Granted permissions for database user "${selectedUser}" on "${db?.name}"` });
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* DB Creation forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
        {/* Create Db */}
        <form onSubmit={handleCreateDb} className="bg-[#050507] border border-white/5 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" /> Create New Database
            <CompanionHelp text="Database holds application data. After creating a database, remember to create a database user and assign them to the database." />
          </h4>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">DB Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="hostlab_db"
                className="flex-1 bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500/40"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans px-3.5 py-1.5 rounded cursor-pointer font-semibold shadow-glow-emerald/15">
                Create
              </button>
            </div>
          </div>
        </form>

        {/* Create Db User */}
        <form onSubmit={handleCreateUser} className="bg-[#050507] border border-white/5 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" /> Create Database User
            <CompanionHelp text="Database user defines credentials (username/password) used by your application to authenticate and query Postgres." />
          </h4>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="host_admin"
                className="flex-1 bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none focus:border-emerald-500/40"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans px-3.5 py-1.5 rounded cursor-pointer font-semibold shadow-glow-emerald/15">
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Granting / Associating user with DB */}
      <form onSubmit={handleAssign} className="bg-[#050507] border border-white/5 rounded-lg p-4 space-y-4 select-none">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-blue-400" /> Assign User Access to Database
          <CompanionHelp text="Links database credentials to specific database tables, granting privileges to allow the user profile to read/write tables." />
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select DB</label>
            <select
              value={selectedDbId}
              onChange={(e) => setSelectedDbId(e.target.value)}
              className="w-full bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none cursor-pointer focus:border-emerald-500/40 text-xs"
            >
              <option value="">-- Choose Database --</option>
              {state.cpanel.databases.map(db => (
                <option key={db.id} value={db.id}>{db.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none cursor-pointer focus:border-emerald-500/40 text-xs"
            >
              <option value="">-- Choose User --</option>
              {state.cpanel.dbUsers.map(user => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans py-2 px-3 rounded inline-flex items-center justify-center gap-1 cursor-pointer font-semibold shadow-glow-indigo/15"
            >
              Grant Privileges
            </button>
          </div>
        </div>
      </form>

      {/* Tables showing DB mappings */}
      <div className="bg-[#050507] border border-white/5 rounded-lg overflow-hidden shadow-glow-emerald/2">
        <div className="p-3 bg-[#0d0d12] border-b border-white/5 select-none">
          <span className="font-semibold text-slate-300">Active Relational Databases</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#050507]/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider select-none border-b border-white/5">
              <tr>
                <th className="p-3">Database Name</th>
                <th className="p-3">Granted User Accounts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {state.cpanel.databases.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-slate-500 italic font-sans select-none">
                    No active Postgres databases created.
                  </td>
                </tr>
              ) : (
                state.cpanel.databases.map((db) => (
                  <tr key={db.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{db.name}</td>
                    <td className="p-3">
                      {db.users.length === 0 ? (
                        <span className="text-slate-500 italic font-sans">No users granted access</span>
                      ) : (
                        db.users.map(user => (
                          <span key={user} className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/15 px-2 py-0.5 rounded-full mr-1.5 select-all">
                            {user}
                          </span>
                        ))
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SSL MANAGER VIEW
// ==========================================

const SslManagerView: React.FC = () => {
  const { state, toggleSsl, addTerminalLine } = useSimulator();
  const [isIssuing, setIsIssuing] = useState<string | null>(null);

  const handleIssueSsl = (domain: string) => {
    setIsIssuing(domain);
    // Simulate certificates download (1.5 seconds)
    setTimeout(() => {
      toggleSsl(domain);
      setIsIssuing(null);
      addTerminalLine({ 
        type: 'success', 
        text: `[cPanel SSL/TLS] Let's Encrypt Certificate issued successfully for: ${domain}` 
      });
    }, 1500);
  };

  const domainsToSecure = ['hostlab.local', 'api.hostlab.local'];

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      <div className="bg-[#050507] border border-white/5 rounded-lg p-4 text-slate-400 leading-relaxed font-sans">
        SSL Certificates establish encrypted secure sockets layer (HTTPS) connections for server visitors. You can issue free **Let&apos;s Encrypt SSL/TLS Certificates** dynamically for all DNS-mapped domain spaces instantly.
      </div>

      <div className="grid gap-3">
        {domainsToSecure.map((dom) => {
          const hasSsl = state.cpanel.sslCertificates.includes(dom);
          const isPending = isIssuing === dom;
          return (
            <div
              key={dom}
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                hasSsl
                  ? 'bg-emerald-500/5 border-emerald-500/20 shadow-glow-emerald/2'
                  : 'bg-[#050507] border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {hasSsl ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-slate-500 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 font-mono">{dom}</h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed font-sans mt-0.5">
                    {hasSsl ? 'Secure HTTPS enabled. RSA 2048-bit certificate' : 'Insecure HTTP. Visitors receive connection warnings'}
                  </p>
                </div>
              </div>

              <div>
                {isPending ? (
                  <div className="bg-[#15151a] border border-white/5 text-slate-300 text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5 font-bold animate-pulse font-mono">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> Generating RSA Keys...
                  </div>
                ) : hasSsl ? (
                  <button
                    onClick={() => {
                      toggleSsl(dom);
                      addTerminalLine({ type: 'info', text: `[cPanel SSL] Uninstalled certificate for: ${dom}` });
                    }}
                    className="bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 text-red-450 text-xs px-3.5 py-1.5 rounded-lg font-sans font-semibold cursor-pointer transition-colors"
                  >
                    Uninstall SSL
                  </button>
                ) : (
                  <button
                    onClick={() => handleIssueSsl(dom)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4 py-2 rounded-lg font-sans font-semibold cursor-pointer transition-colors shadow-glow-cyan/10"
                  >
                    AutoSSL Let&apos;s Encrypt
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 5. DOMAINS & SUBDOMAINS VIEW
// ==========================================

const SubdomainsView: React.FC = () => {
  const { state, createSubdomain, addTerminalLine } = useSimulator();
  const [newSub, setNewSub] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    
    // Add domain suffix
    const suffix = '.hostlab.local';
    const subDomainFull = newSub.trim().includes('.') 
      ? newSub.trim() 
      : newSub.trim() + suffix;

    createSubdomain(subDomainFull);
    addTerminalLine({ type: 'success', text: `[cPanel Subdomain] Created domain space: ${subDomainFull}` });
    setNewSub('');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <form onSubmit={handleCreate} className="bg-[#050507] border border-white/5 rounded-lg p-4 space-y-3 select-none">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-400" /> Provision Subdomain Space
        </h4>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subdomain Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              placeholder="blog"
              className="flex-1 bg-[#0d0d12] border border-white/5 rounded p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500/50 text-xs"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans px-4 py-1.5 rounded cursor-pointer font-semibold shadow-glow-indigo/15">
              Create Subdomain
            </button>
          </div>
          <span className="text-[10px] text-slate-500 mt-1.5 block select-none font-sans">
            Will automatically configure DNS mapping A-records inside host server01.
          </span>
        </div>
      </form>

      <div className="bg-[#050507] border border-white/5 rounded-lg overflow-hidden shadow-glow-indigo/2">
        <div className="p-3 bg-[#0d0d12] border-b border-white/5 select-none">
          <span className="font-semibold text-slate-300">Configured Domains List</span>
        </div>
        <table className="w-full text-left select-text">
          <tbody className="divide-y divide-white/5 text-slate-300">
            <tr className="hover:bg-white/5 transition-colors">
              <td className="p-3 font-bold text-slate-200 font-mono">hostlab.local</td>
              <td className="p-3 text-xs text-slate-500 font-sans text-right">Primary Main Domain</td>
            </tr>
            {state.cpanel.subdomains.map((sub) => (
              <tr key={sub} className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-semibold text-slate-300 font-mono">{sub}</td>
                <td className="p-3 text-xs text-slate-400 font-sans text-right">Active Subdomain</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 6. CRON JOBS SCHEDULER VIEW
// ==========================================

const CronJobsView: React.FC = () => {
  const { state, addCronJob, deleteCronJob, addTerminalLine } = useSimulator();
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');
  const [command, setCommand] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    addCronJob({
      minute,
      hour,
      dayOfMonth: dom,
      month,
      dayOfWeek: dow,
      command: command.trim()
    });

    addTerminalLine({ type: 'success', text: `[cPanel Cron] Scheduled background cron job: ${minute} ${hour} ${dom} ${month} ${dow} ${command.trim()}` });
    setCommand('');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <form onSubmit={handleAdd} className="bg-[#050507] border border-white/5 rounded-lg p-4 space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-400" /> Create Scheduled Cron Job
        </h4>

        <div className="grid grid-cols-5 gap-2 select-none">
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">Min</label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="w-full text-center bg-[#0d0d12] border border-white/5 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">Hour</label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full text-center bg-[#0d0d12] border border-white/5 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">Day</label>
            <input
              type="text"
              value={dom}
              onChange={(e) => setDom(e.target.value)}
              className="w-full text-center bg-[#0d0d12] border border-white/5 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">Mon</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full text-center bg-[#0d0d12] border border-white/5 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">Week</label>
            <input
              type="text"
              value={dow}
              onChange={(e) => setDow(e.target.value)}
              className="w-full text-center bg-[#0d0d12] border border-white/5 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 select-none">Execution CLI Command</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="bash /home/student/api/backup.sh"
              className="flex-1 bg-[#0d0d12] border border-white/5 rounded p-2 text-slate-200 focus:outline-none focus:border-indigo-500/40 font-mono"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold px-4 py-1 rounded cursor-pointer transition-colors shadow-glow-indigo/15">
              Schedule
            </button>
          </div>
        </div>
      </form>

      <div className="bg-[#050507] border border-white/5 rounded-lg overflow-hidden shadow-glow-indigo/2">
        <div className="p-3 bg-[#0d0d12] border-b border-white/5 select-none">
          <span className="font-semibold text-slate-300">Configured Cron Tab (crontab -l)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-white/5">
            <thead className="bg-[#050507]/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider select-none border-b border-white/5">
              <tr>
                <th className="p-3">Schedule Spec</th>
                <th className="p-3">Executable Command</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {state.cpanel.cronJobs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-500 italic font-sans select-none">
                    No crontab events scheduled.
                  </td>
                </tr>
              ) : (
                state.cpanel.cronJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold font-mono text-cyan-400">
                      {job.minute} {job.hour} {job.dayOfMonth} {job.month} {job.dayOfWeek}
                    </td>
                    <td className="p-3 text-slate-200 select-all font-semibold font-mono truncate max-w-[250px]">{job.command}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          deleteCronJob(job.id);
                          addTerminalLine({ type: 'info', text: `[cPanel Cron] Deleted scheduled job ID: ${job.id}` });
                        }}
                        className="p-1 hover:bg-red-500/10 text-slate-450 hover:text-red-400 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
