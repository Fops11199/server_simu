import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Server, Plus, Play, Square, RefreshCw, Key, ShieldCheck, Database, 
  Network, Globe, Shield, HelpCircle, HardDrive, Cpu, Terminal as TermIcon, 
  ExternalLink, ChevronRight, Lock, User, Users, FileCode, CheckCircle, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../stores/useUIStore';

const CompanionHelp: React.FC<{ text: string }> = ({ text }) => {
  const { companionOpen } = useUIStore();
  if (!companionOpen) return null;
  return (
    <span className="relative group cursor-help inline-block ml-1.5 shrink-0 select-none normal-case font-sans">
      <span className="w-4 h-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold flex items-center justify-center animate-pulse">
        ?
      </span>
      <span className="absolute z-[999] hidden group-hover:block w-52 p-2.5 bg-slate-950 border border-yellow-500/30 text-slate-350 text-[10px] rounded-lg shadow-2xl leading-normal bottom-full mb-2 left-1/2 -translate-x-1/2">
        {text}
        <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-950 border-r border-b border-yellow-500/30 rotate-45"></span>
      </span>
    </span>
  );
};

type AwsService = 'dashboard' | 'ec2' | 's3' | 'rds' | 'route53' | 'iam';

interface Ec2Instance {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'terminated';
  ip: string;
  ami: string;
  sg: string;
}

interface S3Bucket {
  id: string;
  name: string;
  region: string;
  isPublic: boolean;
  files: string[];
}

interface RdsInstance {
  id: string;
  name: string;
  engine: 'PostgreSQL' | 'MySQL' | 'Aurora Serverless';
  status: 'available' | 'creating' | 'stopped';
  endpoint: string;
  size: string;
}

export const AwsTab: React.FC = () => {
  const { state, updateState, addTerminalLine } = useSimulator();
  const [activeService, setActiveService] = useState<AwsService>('dashboard');

  // AWS Specific Simulated States
  const [instances, setInstances] = useState<Ec2Instance[]>(() => {
    const saved = localStorage.getItem('aws_instances_tracker');
    return saved ? JSON.parse(saved) : [
      { id: 'i-0a8c23f9821db', name: 'Web Server Node', type: 't3.micro', status: 'running', ip: '54.210.88.192', ami: 'Amazon Linux 2023', sg: 'sg-01ab HTTP/SSH' }
    ];
  });

  const [buckets, setBuckets] = useState<S3Bucket[]>(() => {
    const saved = localStorage.getItem('aws_buckets_tracker');
    return saved ? JSON.parse(saved) : [
      { id: 'b-01', name: 'hostlab-frontend-assets', region: 'us-east-1', isPublic: false, files: ['index.html', 'main.js'] }
    ];
  });

  const [rdsInstances, setRdsInstances] = useState<RdsInstance[]>(() => {
    const saved = localStorage.getItem('aws_rds_tracker');
    return saved ? JSON.parse(saved) : [
      { id: 'db-0489c', name: 'production-postgres-rds', engine: 'PostgreSQL', status: 'available', endpoint: 'production-postgres-rds.c1234.us-east-1.rds.amazonaws.com', size: 'db.t3.micro' }
    ];
  });

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('aws_instances_tracker', JSON.stringify(instances));
  }, [instances]);

  useEffect(() => {
    localStorage.setItem('aws_buckets_tracker', JSON.stringify(buckets));
  }, [buckets]);

  useEffect(() => {
    localStorage.setItem('aws_rds_tracker', JSON.stringify(rdsInstances));
  }, [rdsInstances]);

  const [iamUsers, setIamUsers] = useState<{ username: string; groups: string[]; accessKey: string }[]>([
    { username: 'deployer-agent', groups: ['CI-CD-Automation'], accessKey: 'AKIAIOSFODNN7EXAMPLE' }
  ]);

  // EC2 Launcher Wizard State
  const [launchName, setLaunchName] = useState('App-Server-Node');
  const [launchAmi, setLaunchAmi] = useState('Amazon Linux 2023');
  const [launchType, setLaunchType] = useState('t3.micro');
  const [launchSg, setLaunchSg] = useState('sg-default');
  const [isLaunching, setIsLaunching] = useState(false);

  // S3 Bucket Creator Wizard State
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketRegion, setNewBucketRegion] = useState('us-east-1');
  const [blockPublicAccess, setBlockPublicAccess] = useState(true);

  // RDS Creator state
  const [newDbName, setNewDbName] = useState('wordpress-rds-db');
  const [newDbEngine, setNewDbEngine] = useState<'PostgreSQL' | 'MySQL' | 'Aurora Serverless'>('MySQL');

  // IAM User Creator State
  const [newIamUser, setNewIamUser] = useState('');
  const [iamPolicy, setIamPolicy] = useState('AmazonS3FullAccess');

  // Handle EC2 launch
  const handleLaunchInstance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);

    setTimeout(() => {
      const instId = `i-0${Math.random().toString(16).substring(2, 14)}`;
      const ip = `3.235.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`;
      const newInst: Ec2Instance = {
        id: instId,
        name: launchName.trim() || 'App-Server',
        type: launchType,
        status: 'running',
        ip,
        ami: launchAmi,
        sg: launchSg
      };
      setInstances(prev => [...prev, newInst]);
      setIsLaunching(false);
      setLaunchName('App-Server-Node');

      // Add domain to DNS zones
      updateState({
        dnsRecords: [
          ...state.dnsRecords,
          { id: `dns_aws_${Date.now()}`, name: `${newInst.name.toLowerCase().replace(/\s+/g, '-')}.hostlab.local`, type: 'A', value: ip, ttl: 300 }
        ]
      });

      addTerminalLine({ type: 'success', text: `[AWS Console] Launched EC2 instance ${instId} (${launchType}). IP: ${ip}` });
      addTerminalLine({ type: 'success', text: `[AWS Console] Binding standard Security Group security rules: ${launchSg}` });
    }, 1500);
  };

  // Handle S3 Bucket creation
  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    const bucketName = newBucketName.trim().toLowerCase().replace(/[^a-z0-9.-]/g, '');
    const newB: S3Bucket = {
      id: `b-${Date.now()}`,
      name: bucketName,
      region: newBucketRegion,
      isPublic: !blockPublicAccess,
      files: ['default.png']
    };
    setBuckets(prev => [...prev, newB]);
    setNewBucketName('');
    addTerminalLine({ type: 'success', text: `[AWS Console] Created S3 bucket: s3://${bucketName} in Region: ${newBucketRegion}` });
    alert(`S3 bucket s3://${bucketName} successfully initialized!`);
  };

  // Handle RDS Database creation
  const handleCreateRds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    const newDb: RdsInstance = {
      id: `db-${Math.random().toString(16).substring(2, 7)}`,
      name: newDbName.trim(),
      engine: newDbEngine,
      status: 'available',
      endpoint: `${newDbName.trim()}.c6821.us-east-1.rds.amazonaws.com`,
      size: 'db.t3.micro'
    };
    setRdsInstances(prev => [...prev, newDb]);
    setNewDbName('');
    addTerminalLine({ type: 'success', text: `[AWS Console] Provisioned multi-AZ RDS database instance ${newDb.name} (${newDbEngine})` });
    alert(`RDS Database Instance ${newDb.name} has been successfully provisioned!`);
  };

  // Handle IAM user creation
  const handleCreateIam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIamUser.trim()) return;

    const key = `AKIA${Math.random().toString(36).substring(2, 18).toUpperCase()}`;
    setIamUsers(prev => [
      ...prev,
      { username: newIamUser.trim(), groups: [iamPolicy], accessKey: key }
    ]);
    setNewIamUser('');
    addTerminalLine({ type: 'success', text: `[AWS Console] Created IAM user: ${newIamUser}. Attached policy: ${iamPolicy}` });
    alert(`IAM user ${newIamUser} successfully provisioned! Access Key: ${key}`);
  };

  const handlePowerInstance = (id: string, action: 'stop' | 'start' | 'terminate') => {
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
        if (action === 'terminate') {
          return { ...inst, status: 'terminated' };
        }
        return { ...inst, status: action === 'stop' ? 'stopped' : 'running' };
      }
      return inst;
    }).filter(inst => inst.status !== 'terminated'));

    addTerminalLine({ type: 'info', text: `[AWS Console] EC2 Action: ${action.toUpperCase()} on instance ${id}` });
  };

  return (
    <div className="flex flex-col gap-5 h-full text-slate-800 bg-slate-100 p-4 rounded-xl border border-slate-200 select-none font-sans">
      
      {/* ================= AWS BRAND NAV BAR ================= */}
      <div className="bg-[#1e293b] rounded-xl p-4 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border-b-2 border-[#FF9900]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#FF9900] text-slate-900 flex items-center justify-center font-black text-xs tracking-tighter">
            aws
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider leading-none">Management Console</h2>
            <p className="text-[9px] text-slate-400 font-mono mt-1">Enterprise Cloud Platforms Sandbox</p>
          </div>
        </div>

        {/* Services Dropdown Bar */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
          {[
            { id: 'dashboard', label: 'Console Home' },
            { id: 'ec2', label: 'EC2 (Compute)' },
            { id: 's3', label: 'S3 (Storage)' },
            { id: 'rds', label: 'RDS (Database)' },
            { id: 'route53', label: 'Route53 (DNS)' },
            { id: 'iam', label: 'IAM (Access)' }
          ].map(svc => {
            const isSel = activeService === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => setActiveService(svc.id as AwsService)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  isSel ? 'bg-[#FF9900] text-slate-950 font-black' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {svc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= AWS SIDEBAR FILTERS AND MAIN WORKSPACE ================= */}
      <div className="flex flex-col lg:flex-row gap-5 h-full min-h-[450px]">
        
        {/* AWS Internal Sidebar Navigation */}
        <div className="lg:w-56 shrink-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm select-none">
          <div className="px-1 py-2 border-b border-slate-100 mb-2 font-black text-[11px] text-slate-500 uppercase tracking-wider font-sans">
            AWS cloud explorer
          </div>

          {[
            { id: 'dashboard', label: 'Console Dashboard', count: null },
            { id: 'ec2', label: 'Elastic Compute (EC2)', count: instances.length },
            { id: 's3', label: 'Simple Storage (S3)', count: buckets.length },
            { id: 'rds', label: 'Relational DBs (RDS)', count: rdsInstances.length },
            { id: 'route53', label: 'Global Route53 DNS', count: null },
            { id: 'iam', label: 'Access Control (IAM)', count: iamUsers.length }
          ].map(item => {
            const isSel = activeService === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveService(item.id as AwsService)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSel 
                    ? 'bg-slate-100 text-slate-900 border-l-4 border-[#FF9900]' 
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== null && (
                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{item.count}</span>
                )}
              </button>
            );
          })}

          {/* Quick billing status indicator */}
          <div className="mt-auto pt-3 border-t border-slate-150 text-[10px] text-slate-400 select-none">
            <span className="font-bold text-slate-500 uppercase block mb-1">Simulated Billing</span>
            <div>Free-Tier Eligible Allocation</div>
            <div className="font-mono text-[#FF9900] font-bold mt-0.5">$0.00 current balance</div>
          </div>
        </div>

        {/* AWS Workspace Content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 overflow-hidden flex flex-col shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="h-full space-y-5"
            >
              
              {/* ================= AWS DASHBOARD HOME ================= */}
              {activeService === 'dashboard' && (
                <div className="space-y-5">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 select-none text-xs leading-relaxed text-slate-700">
                    <AlertTriangle className="w-5 h-5 text-[#FF9900] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 font-bold block mb-0.5">Enterprise Infrastructure Philosophy:</strong>
                      Amazon Web Services (AWS) is an industry-grade, enterprise cloud. Instead of simple packages, everything on AWS is partitioned into modular microservices. You do not just "buy a server" — you launch an <strong>EC2 instance</strong>, set up <strong>Security Groups (firewalls)</strong>, bind an <strong>Elastic IP</strong>, assign database endpoints using <strong>RDS</strong>, and route traffic with <strong>Route53</strong>!
                    </div>
                  </div>

                  {/* Services status bento grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                    <div className="border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setActiveService('ec2')}>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-1">
                        <Cpu className="w-4 h-4 text-orange-500" /> Elastic Compute Cloud (EC2)
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Virtual machines in the cloud. We currently have <strong>{instances.length} EC2 micro instances</strong> active, hosting cloud directories.
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setActiveService('s3')}>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-1">
                        <HardDrive className="w-4 h-4 text-emerald-500" /> Simple Storage Service (S3)
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Highly durable global object buckets. Hosts static frontend files and public build assets under <strong>{buckets.length} active buckets</strong>.
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setActiveService('rds')}>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4 text-blue-500" /> Relational Database Service (RDS)
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Managed SQL server nodes. Separates database memory blocks from virtual application storage, handling auto-scaling replicas.
                      </p>
                    </div>

                    <div className="border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-colors cursor-pointer" onClick={() => setActiveService('iam')}>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-indigo-500" /> Identity & Access (IAM)
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Configure secure credential tokens, API access policies, and group roles to secure deployment services.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= EC2 INSTANCES ================= */}
              {activeService === 'ec2' && (
                <div className="space-y-4">
                  {/* EC2 launching form */}
                  <form onSubmit={handleLaunchInstance} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Launch Fresh EC2 Instance (Virtual Machine)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Instance Name Tag</label>
                        <input
                          type="text"
                          value={launchName}
                          onChange={(e) => setLaunchName(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Machine Image (AMI)</label>
                        <select
                          value={launchAmi}
                          onChange={(e) => setLaunchAmi(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 cursor-pointer"
                        >
                          <option value="Amazon Linux 2023">Amazon Linux 2023</option>
                          <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS</option>
                          <option value="Windows Server Standard">Windows Server 2022</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Instance Size</label>
                        <select
                          value={launchType}
                          onChange={(e) => setLaunchType(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 cursor-pointer"
                        >
                          <option value="t2.micro">t2.micro (1 vCPU, 1GB RAM) • Free Tier</option>
                          <option value="t3.small">t3.small (2 vCPU, 2GB RAM)</option>
                          <option value="m5.large">m5.large (2 vCPU, 8GB RAM)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Security Group (Firewall)</label>
                        <select
                          value={launchSg}
                          onChange={(e) => setLaunchSg(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 cursor-pointer"
                        >
                          <option value="sg-default">sg-default (Only port 22 SSH open)</option>
                          <option value="sg-webserver">sg-webserver (Ports 80 HTTP, 443 HTTPS, 22 SSH open)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLaunching}
                      className="bg-[#FF9900] hover:bg-[#e08500] text-slate-950 font-black px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      {isLaunching ? 'Provisioning AWS micro VM...' : 'Launch EC2 Instance'}
                    </button>
                  </form>

                  {/* EC2 Instances Directory */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden font-sans text-xs">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700">
                      EC2 Instances Directory
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="p-3">Instance ID</th>
                            <th className="p-3">Name Tag</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Public IPv4</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {instances.map(inst => (
                            <tr key={inst.id} className="hover:bg-slate-50">
                              <td className="p-3 text-slate-450">{inst.id}</td>
                              <td className="p-3 font-sans text-slate-800 font-bold">{inst.name}</td>
                              <td className="p-3 text-slate-500">{inst.type}</td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  inst.status === 'running' ? 'bg-green-100 text-green-700 border border-green-150' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {inst.status}
                                </span>
                              </td>
                              <td className="p-3 text-[#FF9900] font-semibold">{inst.ip}</td>
                              <td className="p-3 text-right font-sans">
                                <button
                                  onClick={() => handlePowerInstance(inst.id, inst.status === 'running' ? 'stop' : 'start')}
                                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer mr-3"
                                >
                                  {inst.status === 'running' ? 'Stop' : 'Start'}
                                </button>
                                <button
                                  onClick={() => handlePowerInstance(inst.id, 'terminate')}
                                  className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                                >
                                  Terminate
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= S3 STORAGE ================= */}
              {activeService === 's3' && (
                <div className="space-y-4 select-none">
                  {/* Create S3 Bucket form */}
                  <form onSubmit={handleCreateBucket} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      Create S3 Storage Bucket (Global Object Storage)
                      <CompanionHelp text="Simple Storage Service (S3) provides cloud folders (buckets) to store media, files, and templates securely." />
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs items-end">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Unique Bucket Name (DNS compliant)</label>
                        <input
                          type="text"
                          value={newBucketName}
                          onChange={(e) => setNewBucketName(e.target.value)}
                          placeholder="e.g. hostlab-frontend-assets"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">AWS Region</label>
                        <select
                          value={newBucketRegion}
                          onChange={(e) => setNewBucketRegion(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 cursor-pointer"
                        >
                          <option value="us-east-1">US East (N. Virginia)</option>
                          <option value="eu-central-1">Europe (Frankfurt)</option>
                          <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pb-2.5">
                        <input
                          type="checkbox"
                          id="block-public-acc"
                          checked={blockPublicAccess}
                          onChange={(e) => setBlockPublicAccess(e.target.checked)}
                          className="w-4 h-4 text-[#FF9900] border-slate-300 rounded focus:ring-[#FF9900] cursor-pointer"
                        />
                        <label htmlFor="block-public-acc" className="font-bold text-slate-700 cursor-pointer text-[11px]">
                          Block all Public Access (Recommended)
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#FF9900] hover:bg-[#e08500] text-slate-950 font-black px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Create S3 Bucket
                    </button>
                  </form>

                  {/* S3 Buckets directory list */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700">
                      S3 Buckets Directory (s3://)
                    </div>
                    <div className="divide-y divide-slate-150">
                      {buckets.map(b => (
                        <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50">
                          <div>
                            <strong className="text-[#FF9900] block text-sm font-mono">s3://{b.name}</strong>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">Region: {b.region} • Objects: {b.files.join(', ')}</span>
                          </div>

                          <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full ${
                            b.isPublic ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 border border-slate-200 text-slate-500'
                          }`}>
                            {b.isPublic ? 'Public Access Open' : 'Bucket Private'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= RDS DATABASES ================= */}
              {activeService === 'rds' && (
                <div className="space-y-4 font-sans text-xs">
                  {/* Create RDS Instance form */}
                  <form onSubmit={handleCreateRds} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      Provision Managed Relational SQL Database (RDS)
                      <CompanionHelp text="Relational Database Service (RDS). Spins up managed database endpoints (Postgres/MySQL) with built-in backup controls." />
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">DB Instance Name Identification</label>
                        <input
                          type="text"
                          value={newDbName}
                          onChange={(e) => setNewDbName(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Database Engine Options</label>
                        <select
                          value={newDbEngine}
                          onChange={(e) => setNewDbEngine(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 cursor-pointer text-xs"
                        >
                          <option value="MySQL">MySQL Community Edition</option>
                          <option value="PostgreSQL">PostgreSQL Community Edition</option>
                          <option value="Aurora Serverless">Amazon Aurora Serverless (Auto-scaling)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#FF9900] hover:bg-[#e08500] text-slate-950 font-black px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Launch RDS Database Instance
                    </button>
                  </form>

                  {/* RDS instances table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden font-sans">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700">
                      Managed RDS Relational Instances
                    </div>
                    <div className="divide-y divide-slate-150">
                      {rdsInstances.map(rds => (
                        <div key={rds.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 font-mono text-[11px]">
                            <strong className="text-slate-800 text-xs font-sans block">{rds.name} ({rds.engine})</strong>
                            <div className="text-slate-400 mt-0.5">Endpoint: <span className="text-[#FF9900] font-semibold">{rds.endpoint}</span></div>
                            <div className="text-[10px] text-slate-500">Size: {rds.size} • State: <span className="text-green-600 font-bold">{rds.status}</span></div>
                          </div>

                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= ROUTE 53 DNS ================= */}
              {activeService === 'route53' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5 select-none">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide">Route53 Global DNS Hosted Zones</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      AWS Route53 connects user domains (e.g., example.com) to S3 buckets, EC2 virtual routers, and CloudFront static distribution endpoints using high-availability name servers.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700 font-sans">
                      Configured Hosted Zone Records
                    </div>
                    <div className="divide-y divide-slate-100">
                      {state.dnsRecords.map(rec => (
                        <div key={rec.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-850">{rec.name}</span>
                            <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Route policy: Simple Routing • Type: {rec.type}</span>
                          </div>
                          <span className="text-slate-700 font-semibold">{rec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= IAM ROLES ================= */}
              {activeService === 'iam' && (
                <div className="space-y-4 font-sans text-xs">
                  {/* Create IAM user form */}
                  <form onSubmit={handleCreateIam} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Create IAM Administrative User & Access Keys
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">IAM Username</label>
                        <input
                          type="text"
                          value={newIamUser}
                          onChange={(e) => setNewIamUser(e.target.value)}
                          placeholder="e.g. cicd-deployer"
                          required
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-xs text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">Attach Permission Policies</label>
                        <select
                          value={iamPolicy}
                          onChange={(e) => setIamPolicy(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 cursor-pointer text-xs"
                        >
                          <option value="AmazonS3FullAccess">AmazonS3FullAccess (Only bucket reads/writes)</option>
                          <option value="AmazonEC2FullAccess">AmazonEC2FullAccess (Control compute resources)</option>
                          <option value="AdministratorAccess">AdministratorAccess (Full admin permissions)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-[#FF9900] hover:bg-[#e08500] text-slate-950 font-black px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      Provision IAM User
                    </button>
                  </form>

                  {/* Active IAM directory */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-700">
                      Active Access Keys & Users Directory
                    </div>
                    <div className="divide-y divide-slate-100 font-mono text-[11px]">
                      {iamUsers.map((usr, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50">
                          <div>
                            <strong className="text-slate-800 text-xs font-sans block">{usr.username}</strong>
                            <div className="text-[10px] text-slate-400 mt-0.5">Access Key ID: {usr.accessKey}</div>
                          </div>
                          <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-bold font-sans px-2.5 py-0.5 rounded-full">
                            Policy: {usr.groups.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
