import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Award, CheckCircle2, Circle, HelpCircle, Terminal, Network, 
  Database, Play, ChevronRight, ChevronLeft, Lock, BookOpen, Layers, 
  ShieldAlert, Compass, Sparkles, Trophy, Clock, Check, RefreshCw,
  GraduationCap, Book, Lightbulb, ArrowRight, ShieldCheck, FileText, Share2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LabObjective {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface Lab {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Shared Hosting' | 'VPS Management' | 'Cloud Operations';
  providerName: string;
  providerId: 'hostinger' | 'cpanel' | 'contabo' | 'digitalocean' | 'aws';
  creditsReward: number;
  description: string;
  learningOutcomes: string[];
  objectives: LabObjective[];
  hints: string[];
}

interface AcademySlide {
  title: string;
  concept: string;
  illustration: string;
  analogyTitle: string;
  analogyText: string;
  keyPoints: string[];
}

interface AcademyGlossary {
  term: string;
  definition: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AcademyCourse {
  id: string;
  title: string;
  category: 'Shared Hosting' | 'VPS Management' | 'Cloud Operations';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  creditsReward: number;
  badgeColor: string;
  description: string;
  slides: AcademySlide[];
  glossary: AcademyGlossary[];
  quiz: QuizQuestion[];
  unlockedLabId: string;
}

interface LabsTabProps {
  setActiveTab: (tab: string) => void;
  setActiveProvider: (providerId: string) => void;
}

export const LabsTab: React.FC<LabsTabProps> = ({ setActiveTab, setActiveProvider }) => {
  const { state, xp, addTerminalLine } = useSimulator();
  
  // High-level navigation: 'academy' (Theory Modules) or 'labs' (Hands-on Practice)
  const [viewMode, setViewMode] = useState<'academy' | 'labs'>('academy');
  
  // Academy Active states
  const [activeCourseId, setActiveCourseId] = useState<string>('course_0');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [activeCourseSubTab, setActiveCourseSubTab] = useState<'lessons' | 'glossary' | 'quiz'>('lessons');
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizError, setQuizError] = useState<string | null>(null);
  
  // Graduation/Certificate states
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('hostlab_completed_quizzes');
    return saved ? JSON.parse(saved) : {};
  });
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [certCourse, setCertCourse] = useState<AcademyCourse | null>(null);

  // Labs Active states
  const [activeLabId, setActiveLabId] = useState<string>('lab_0');
  const [expandedHint, setExpandedHint] = useState<number | null>(null);
  const [labStatuses, setLabStatuses] = useState<Record<string, { completed: boolean; objectives: Record<string, boolean> }>>({});
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [justCompletedLab, setJustCompletedLab] = useState<Lab | null>(null);
  
  // Total virtual credits earned
  const [virtualCredits, setVirtualCredits] = useState<number>(() => {
    const saved = localStorage.getItem('hostlab_credits');
    return saved ? parseInt(saved, 10) : 100; // start with 100 base credits
  });

  const coursesList: AcademyCourse[] = [
    {
      id: 'course_0',
      title: 'Introduction to Servers & Hardware 101',
      category: 'Shared Hosting',
      difficulty: 'Beginner',
      creditsReward: 30,
      badgeColor: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
      description: 'Start from absolute scratch! Learn what a server actually is, how the client-server request model works, and the physical datacenter machines powering the internet.',
      slides: [
        {
          title: 'What is a Server?',
          concept: 'A server is simply a specialized computer that runs 24/7 without a monitor, waiting to answer requests from visitors.',
          illustration: '┌─────────────────────────────────────────────────────────┐\n│                   A PHYSICAL SERVER UNIT                │\n│  ┌───────────────────────────────────────────────────┐  │\n│  │ [ CPU Core ]   [ RAM Slots ]   [ SSD Hard Drive ] │  │\n│  │                                                   │  │\n│  │ [ Network Interface Card (Connected to Internet) ]│  │\n│  └───────────────────────────────────────────────────┘  │\n│  No screen, no keyboard, just pure computing power.    │\n└─────────────────────────────────────────────────────────┘',
          analogyTitle: 'The Restaurant Kitchen',
          analogyText: 'Imagine visiting a restaurant. You are the "Client" sitting at the table. The menu is the website domain, and the kitchen is the "Server". You order a burger (make an HTTP request), the kitchen cooks it (server processes code and fetches database values), and the waiter delivers the plate to your table (sends back an HTML response). A server is just that kitchen—processing requests and serving files.',
          keyPoints: [
            'Servers are physical computers stacked in metal racks inside massive data centers.',
            'They do not have monitors; administrators configure them remotely using SSH or control panels.',
            'They run specialized server operating systems like Linux (Ubuntu, Debian, AlmaLinux) or Windows Server.'
          ]
        },
        {
          title: 'The Client-Server Loop',
          concept: 'Every website visit triggers a Request-Response cycle between your browser (client) and the remote host (server).',
          illustration: '[ Your Browser (Client) ] ──── HTTP GET request ───> [ Web Server (Node/Nginx) ]\n                                                      │ Processes file\n[ Your Browser (Client) ] <─── HTML/CSS/JS/JSON ───── [ Web Server (Node/Nginx) ]',
          analogyTitle: 'Sending a Letter to a Store',
          analogyText: 'When you want to buy an item from a catalog, you write a request letter, put an address on it, and mail it (Client Request). The store clerk reads your letter, grabs the item from the warehouse, and mails it back to your physical address (Server Response). If you write the wrong address (invalid URL), the mail is returned with a "not found" notice (Error 404).',
          keyPoints: [
            'The client initiates the connection; the server listens and responds.',
            'Requests carry metadata like headers, request methods (GET, POST), and query parameters.',
            'Responses carry a Status Code (e.g., 200 OK, 404 Not Found, 500 Internal Server Error).'
          ]
        },
        {
          title: 'IP Addresses and Server Ports',
          concept: 'An IP address points to the entire server machine, while a Port directs traffic to a specific software program running inside it.',
          illustration: 'Server IP: 203.0.113.10\n  ├── Port 80   ───> HTTP Web Traffic (Nginx)\n  ├── Port 443  ───> HTTPS Secure Web Traffic (Nginx)\n  ├── Port 22   ───> SSH Secure Terminal Console\n  └── Port 5432 ───> PostgreSQL Database Server',
          analogyTitle: 'The Apartment Building Mailboxes',
          analogyText: 'If a server\'s IP address is like the building\'s street address (e.g., 123 Cloud Lane), then Ports are like the individual apartment mailbox numbers. Mail for the web developer goes to Apt 80, secure packages go to Apt 443, and the building supervisor\'s secure keys go to Apt 22. Without port numbers, the mail carrier wouldn\'t know which resident should receive the package.',
          keyPoints: [
            'IP addresses are unique numbers (IPv4/IPv6) assigned to every device on a network.',
            'Ports range from 0 to 65535, with standard ports reserved for specific protocols (HTTP: 80, HTTPS: 443, SSH: 22, MySQL: 3306).',
            'A firewall blocks unneeded ports to prevent malicious entry.'
          ]
        }
      ],
      glossary: [
        { term: 'Server', definition: 'A dedicated physical or virtual computer designed to process requests and deliver data to other computers over a network.' },
        { term: 'Client', definition: 'The requesting device or software application (typically a web browser) that initiates communication with a server.' },
        { term: 'Request-Response Cycle', definition: 'The standard communication protocol where a client sends a structured request and a server returns a corresponding response.' },
        { term: 'IP Address', definition: 'A unique numerical identifier assigned to each device participating in a computer network.' },
        { term: 'Port', definition: 'A virtual socket number inside an operating system that routes incoming network traffic to a specific software service.' }
      ],
      quiz: [
        {
          question: 'What is a server at its most fundamental physical level?',
          options: [
            'A special brand of smart monitor that does not require electricity.',
            'A computer without a screen that runs continuously in a datacenter to listen for and respond to network requests.',
            'An artificial intelligence model that writes code for browsers.'
          ],
          correctIndex: 1,
          explanation: 'At its core, a server is a real, physical computer designed for continuous uptime, high network throughput, and headless remote administration.'
        },
        {
          question: 'In the client-server request loop, which entity is responsible for initiating communication?',
          options: [
            'The Client (such as a web browser)',
            'The Database server',
            'The Hypervisor hosting layer'
          ],
          correctIndex: 0,
          explanation: 'The client always initiates the request, and the server listens for incoming connections and issues corresponding responses.'
        },
        {
          question: 'If an IP address locates a specific server on the internet, what does a port number do?',
          options: [
            'It increases the physical RAM speed of the motherboard.',
            'It registers the server\'s domain name with domain authorities.',
            'It routes network traffic to a specific software application running inside that server.'
          ],
          correctIndex: 2,
          explanation: 'A port acts as an internal mailbox/address number, directing incoming packets to the correct application (like Nginx on port 80/443, or SSH on port 22).'
        }
      ],
      unlockedLabId: 'lab_0'
    },
    {
      id: 'course_1',
      title: 'Managed Hosting & Domains 101',
      category: 'Shared Hosting',
      difficulty: 'Beginner',
      creditsReward: 30,
      badgeColor: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
      description: 'Understand the building blocks of traditional web hosting. Learn about resource allocation, mapping DNS pointers, and securing public channels with Let\'s Encrypt SSL certificates.',
      slides: [
        {
          title: 'The "Apartment building" Analogy',
          concept: 'Shared Hosting shares a single physical computer server among hundreds of distinct user accounts.',
          illustration: '┌──────────────────────────────────────────────┐\n│               PHYSICAL HARDWARE              │\n│  ┌────────────┐ ┌────────────┐ ┌────────────┐ │\n│  │ Your Site  │ │ Neighbor A │ │ Neighbor B │ │\n│  │ (Folder)   │ │ (Folder)   │ │ (Folder)   │ │\n│  └────────────┘ └────────────┘ └────────────┘ │\n│  SHARED MEMORY / SHARED CPU / SHARED DISK    │\n└──────────────────────────────────────────────┘',
          analogyTitle: 'Renting a Room in an Apartment Complex',
          analogyText: 'Shared hosting is like renting an apartment. It is highly cost-effective and the landlord (the hosting provider) manages common maintenance (OS security updates, hardware repairs). However, if your neighbor holds a massive party (a traffic spike), the elevator gets congested (your site might experience slow load times).',
          keyPoints: [
            'All sites reside on the same OS partition and share a single network link.',
            'Best suited for small-to-medium blogs, static layouts, and prototype APIs.',
            'Providers use custom dashboards like Hostinger hPanel or classic cPanel to manage files.'
          ]
        },
        {
          title: 'The DNS Address Book Mapping',
          concept: 'DNS (Domain Name System) translates user-friendly domains like Google.com into machine-readable IP addresses.',
          illustration: 'User Types: "example.com" ──> [ DNS Server ] ──> Resolves to: "203.0.113.10"\n\n- A Record   ────> Direct IPv4 Pointer (e.g. 203.0.113.10)\n- Subdomain  ────> Partitioned Prefix A Record (e.g. api.example.com)\n- MX Record  ────> Mail Exchange Router for secure inbound emails\n- TXT Record ────> Arbitrary verification strings (SPF, DKIM values)',
          analogyTitle: 'Web\'s Master Contact Directory',
          analogyText: 'A Domain Name is like a person\'s name, and an IP address is their exact physical GPS coordinates. DNS maps the name to the coordinates so visitors don\'t have to memorize complex strings like "159.203.88.42".',
          keyPoints: [
            'A-Records map hostnames directly to a target server IP address.',
            'Subdomains allow you to divide your core domain into distinct segments like "api" or "staging".',
            'DNS propagation can take a few minutes in simulations, but up to 24 hours in real production clusters.'
          ]
        },
        {
          title: 'Databases & Secure Handshakes',
          concept: 'Web applications need a structural datastore (MySQL/PostgreSQL) and encrypted transport (Let\'s Encrypt SSL).',
          illustration: '┌──────────────────┐               ┌──────────────────┐\n│    Web Browser   │ <──(HTTPS)──> │  Hosting Server  │\n│ (Encrypted Port) │               │ (SSL Handshake)  │\n└──────────────────┘               └────────┬─────────┘\n                                            │ (Local Socket)\n                                   ┌────────▼─────────┐\n                                   │ MySQL / Postgres │\n                                   └──────────────────┘',
          analogyTitle: 'Secure Mailboxes and Safe Deposit Boxes',
          analogyText: 'A database is like a structural safe deposit box on the server where structured logs and logins are safely cataloged. An SSL/TLS Certificate acts as a secure, armored postal service between the visitor and the server, ensuring third-party eavesdroppers can\'t intercept secure passwords.',
          keyPoints: [
            'Let\'s Encrypt provides free, automated security handshakes to establish HTTPS.',
            'MySQL and PostgreSQL run as background services, communicating via local TCP sockets (e.g., port 3306 or 5432).',
            'To allow your web app to write data, you must map a DB User to the specific DB Schema with granted privileges.'
          ]
        }
      ],
      glossary: [
        { term: 'A Record', definition: 'The core DNS record mapping a hostname (like "domain.com") directly to an IPv4 destination address.' },
        { term: 'Subdomain', definition: 'A custom prefix applied to a parent domain (e.g. "api.hostlab.com") representing a separate structural routing.' },
        { term: 'Let\'s Encrypt', definition: 'A free, global, automated certificate authority that issues standard SSL certificates to enable secure HTTPS.' },
        { term: 'MySQL', definition: 'One of the most popular open-source relational database management systems, often used in managed hosting.' },
        { term: 'cPanel / hPanel', definition: 'Visual graphical user interfaces built to simplify Linux server operations, domain setups, and database updates.' }
      ],
      quiz: [
        {
          question: 'What happens to a shared hosting environment during a sudden, massive traffic spike on a neighboring website?',
          options: [
            'Your website will be automatically migrated to Amazon Web Services.',
            'Your website may load slower because both sites share the physical host computer CPU and memory.',
            'Your domain name registration will immediately expire.'
          ],
          correctIndex: 1,
          explanation: 'Since shared hosting places multiple customer folders on a single physical machine with shared system boundaries, a resource-heavy neighbor can temporarily impact performance.'
        },
        {
          question: 'Which DNS record type maps a domain name (e.g. example.com) to an IPv4 address?',
          options: [
            'MX Record',
            'CNAME Record',
            'A Record'
          ],
          correctIndex: 2,
          explanation: 'The A (Address) Record is the fundamental DNS record that links a domain name to a public IPv4 IP address.'
        },
        {
          question: 'What is the main objective of installing a Let\'s Encrypt SSL certificate?',
          options: [
            'To encrypt the network connection between browsers and servers, enabling secure HTTPS.',
            'To increase the static file upload speed limit in cPanel.',
            'To schedule automatic backup tasks in Linux.'
          ],
          correctIndex: 0,
          explanation: 'SSL certificates authenticate a website\'s identity and encrypt standard client-server socket communication, replacing insecure HTTP with HTTPS.'
        }
      ],
      unlockedLabId: 'lab_1'
    },
    {
      id: 'course_2',
      title: 'VPS Management & Out-Of-Band VNC',
      category: 'VPS Management',
      difficulty: 'Intermediate',
      creditsReward: 50,
      badgeColor: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
      description: 'Step up to Virtual Private Servers (VPS). Master hypervisors, terminal system management, unmanaged packages, and troubleshooting offline nodes via Out-of-Band graphical VNC.',
      slides: [
        {
          title: 'The VPS "Townhouse" Paradigm',
          concept: 'Virtual Private Servers use physical CPU hypervisors to split raw hardware into completely isolated VM compartments.',
          illustration: '┌─────────────────────────────────────────────────────────┐\n│                     HYPERVISOR HOST                     │\n│  ┌───────────────────────┐   ┌───────────────────────┐  │\n│  │        VPS ONE        │   │        VPS TWO        │  │\n│  │  [ isolated Kernel ]  │   │  [ isolated Kernel ]  │  │\n│  │  - Full Root Access   │   │  - Full Root Access   │  │\n│  │  - Ubuntu OS Instance │   │  - Rocky OS Instance  │  │\n│  └───────────────────────┘   └───────────────────────┘  │\n└─────────────────────────────────────────────────────────┘',
          analogyTitle: 'Owning a Private Townhouse',
          analogyText: 'A VPS is like buying a townhouse. You have your own isolated walls, private utilities, and complete authority to paint the interior or build a custom workshop (full root SSH privileges to install any Linux package). However, you are "unmanaged" — if the interior pipes burst (the server firewall blocks port 22), you are responsible for fixing it.',
          keyPoints: [
            'Each VPS runs its own isolated Operating System kernel and system resources.',
            'Full terminal root access lets you install low-level runtimes (Node, Docker, Go, Python).',
            'Provides significantly better security, resource guarantees, and isolation than shared hosting.'
          ]
        },
        {
          title: 'Out-Of-Band VNC Management',
          concept: 'VNC (Virtual Network Computing) lets you access your VPS screen even if the primary server network interface is completely broken.',
          illustration: 'Primary SSH Port 22 ──────[ OFFLINE / CRASHED ]──────> Blocked!\n\nHypervisor Port 5900 (VNC) ────[ AVAILABLE ]────> Graphical Terminal Login!',
          analogyTitle: 'The Server\'s Emergency Fire Escape',
          analogyText: 'Imagine locking your front door from the inside and breaking the key. You can\'t enter through the front (SSH). VNC is like an emergency window fire escape that operates independently of the building\'s main corridors, letting you slide in, review the system logs, and repair the locks (restoring public ports).',
          keyPoints: [
            'VNC communicates directly with the hypervisor host graphics channel.',
            'Essential for recovering from broken firewall rules, loop routing mistakes, or kernel panics.',
            'Does not require active networks inside the guest OS to function.'
          ]
        },
        {
          title: 'Re-imaging OS Disks',
          concept: 'Re-imaging allows an administrator to wipe the VPS storage disk completely clean and write a fresh OS template.',
          illustration: 'WIPE SSD  ────>  Apply Operating System Image:\n\n[ Ubuntu 24.04 LTS ]   OR   [ Rocky Linux 9.4 ]   OR   [ Debian 12 ]',
          analogyTitle: 'Reformatting a Computer Hard Drive',
          analogyText: 'When a server becomes corrupted beyond repair, or if you want to switch from Debian to Enterprise Rocky Linux, you can issue an instant "Re-image" command. The hypervisor wipes the storage slice and flashes a clean blueprint OS in seconds.',
          keyPoints: [
            'All existing files are permanently deleted during a re-image. Backup structures must reside elsewhere.',
            'Ubuntu is standard for dev-friendly stacks; Rocky Linux provides an enterprise RHEL-compatible ecosystem.',
            'Post-install scripts (cloud-init) configure root credentials and start SSH services automatically.'
          ]
        }
      ],
      glossary: [
        { term: 'Hypervisor', definition: 'The physical software layer (like KVM or VMware) that partitions a host computer into multiple isolated Virtual Machines.' },
        { term: 'Unmanaged VPS', definition: 'A virtual server where the user receives raw system access and handles all firewall, security, backups, and package software manual management.' },
        { term: 'VNC Console', definition: 'An out-of-band graphical viewport protocol connecting directly to the virtual machine hardware console for maintenance when SSH is unavailable.' },
        { term: 'Rocky Linux', definition: 'An enterprise-grade, community-led Linux distribution designed to be 100% bug-for-bug compatible with Red Hat Enterprise Linux (RHEL).' },
        { term: 'SSH (Port 22)', definition: 'Secure Shell protocol used to log in and execute administrative command lines on remote Linux nodes over encrypted networks.' }
      ],
      quiz: [
        {
          question: 'What is the primary troubleshooting advantage of utilizing Out-of-Band VNC Console Access?',
          options: [
            'It speeds up download operations inside the server.',
            'It allows you to log in and repair server configurations even if the OS network interfaces or SSH daemon are offline/broken.',
            'It automatically deletes malware scripts from your file system.'
          ],
          correctIndex: 1,
          explanation: 'VNC connects directly through the underlying hypervisor. Because of this, it is independent of the guest VM\'s internal networking card or SSH settings.'
        },
        {
          question: 'What is the main structural difference between Shared Hosting and an unmanaged VPS?',
          options: [
            'VPS hosting restricts you to using drag-and-drop website builders only.',
            'A VPS grants you complete isolated operating system kernels with full root admin privileges, while shared hosting groups folders together.',
            'VPS databases do not support storing textual information.'
          ],
          correctIndex: 1,
          explanation: 'VPS environments offer complete virtualization with dedicated, isolated system kernels, custom filesystems, and full administrative (root) control.'
        },
        {
          question: 'Which of the following describes the "Re-imaging" process on a VPS server?',
          options: [
            'Creating an aesthetic screenshot of your website for marketing.',
            'Wiping the virtual storage drive completely and flashing a brand new, clean Linux operating system installation.',
            'Increasing the monitor resolution of your out-of-band screen.'
          ],
          correctIndex: 2,
          explanation: 'Re-imaging (or OS reinstallation) wipes the server disk blocks completely clean and deploys a fresh operating system image template.'
        }
      ],
      unlockedLabId: 'lab_3'
    },
    {
      id: 'course_3',
      title: 'Enterprise Cloud Decoupling & S3',
      category: 'Cloud Operations',
      difficulty: 'Advanced',
      creditsReward: 100,
      badgeColor: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
      description: 'Master enterprise-grade cloud topologies. Discover the power of structural decoupling, securing object storage Buckets, and deploying dedicated isolated database fleets.',
      slides: [
        {
          title: 'Decoupling: The Power of Division',
          concept: 'In monolithic hosting, one crash drops everything. Cloud architectures decouple compute, database, and storage.',
          illustration: '  MONOLITHIC (Risk):           DECOUPLED (Resilient):\n┌───────────────────────┐     ┌────────────────┐  ┌───────────────┐\n│ SERVER                │     │ EC2 Compute    │  │ S3 Bucket     │\n│ - Express App Code    │     │ (Replicable VM)│  │ (Static Files)│\n│ - 50GB Uploaded Images│     └───────┬────────┘  └───────────────┘\n│ - PostgreSQL DB       │             │\n└───────────────────────┘     ┌───────▼────────┐\n                              │ RDS Postgres   │\n                              │ (Database Node)│\n                              └────────────────┘',
          analogyTitle: 'Building a High-Tech Smart Factory',
          analogyText: 'Monolithic servers are like a small bakery where one person mixes, bakes, and registers transactions. If they catch a cold, the shop closes. Decoupled cloud architecture is like an automated bakery line: one machine prepares dough (EC2 computes), a dedicated conveyor stores ingredients (S3 stores assets), and a secure accountant logs receipt tallies (RDS manages transactional tables). If the baker machine breaks, the recipes and ledger remain perfectly safe.',
          keyPoints: [
            'If an EC2 server goes down, your persistent user files in S3 and core database records in RDS are untouched.',
            'Allows you to scale compute nodes horizontally (adding more VMs) without duplicating static asset folders.',
            'Substantially increases overall system availability and fault tolerance.'
          ]
        },
        {
          title: 'S3 Object Storage & Security',
          concept: 'Amazon S3 (Simple Storage Service) is a highly durable flat file object store. Security policies control public access.',
          illustration: '┌────────────────────────────────────────────────────────┐\n│                     AMAZON S3 BUCKET                   │\n│  [ Block Public Access: ENABLED ]                      │\n│  ┌───────────────┐  ┌───────────────┐                  │\n│  │  private.pdf  │  │  database.bak │  <─── SECURE!    │\n│  └───────────────┘  └───────────────┘                  │\n│                                                        │\n│  [ Block Public Access: DISABLED ] ───> Public URL     │\n└────────────────────────────────────────────────────────┘',
          analogyTitle: 'The Locked Safety Vault',
          analogyText: 'S3 buckets are flat vaults for file data. They don\'t run server code; they just host files with ultra-high durability. By default, cloud security mandates keeping S3 Buckets absolutely PRIVATE. Allowing open anonymous reads exposes internal assets, media uploads, or sensitive spreadsheets to internet crawlers.',
          keyPoints: [
            'S3 buckets store files as "objects" identified by text keys, bypassing traditional filesystem directories.',
            'The "Block Public Access" feature overrides all folder bucket policies to force complete security blocks.',
            'Private objects are securely downloaded using signed request paths that expire in minutes.'
          ]
        },
        {
          title: 'Managed Databases (RDS)',
          concept: 'Relational Database Service (RDS) provides high-performance, automated databases isolated from the web server.',
          illustration: '┌─────────────────────────┐               ┌─────────────────────────┐\n│   EC2 Client (Web App)  │ ──(TCP Link)──>│   RDS Database Server   │\n│  - Handles HTTP Requests│               │  - Manages Tables       │\n│  - No local DB files    │               │  - Automatic Backups    │\n└─────────────────────────┘               └─────────────────────────┘',
          analogyTitle: 'Hiring a Certified Master Accountant',
          analogyText: 'Instead of running a database manually inside your web server (where disk failures can corrupt tables), RDS provides a dedicated, managed database server. AWS handles automated daily backups, security patching, and replica synchronization, giving your application a bulletproof source of truth.',
          keyPoints: [
            'RDS isolates databases on separate server hardware with dedicated resource quotas.',
            'Supports multiple engines like PostgreSQL, MySQL, MariaDB, and Oracle.',
            'Restricting RDS access via security groups ensures that only authenticated compute instances can connect.'
          ]
        }
      ],
      glossary: [
        { term: 'Decoupled Architecture', definition: 'The practice of separating server compute tasks, transactional data records, and static storage into separate independent cloud assets.' },
        { term: 'Amazon EC2', definition: 'Elastic Compute Cloud: scalable virtual server compute nodes used to run dynamic web application codes.' },
        { term: 'Amazon S3', definition: 'Simple Storage Service: an object datastore designed for high-availability static file hosting, logs, and backups.' },
        { term: 'Amazon RDS', definition: 'Relational Database Service: managed high-performance relational databases with built-in replication, backup, and sizing controls.' },
        { term: 'Block Public Access', definition: 'A centralized AWS master switch that overrides all permissions to ensure that S3 bucket objects cannot be accessed anonymously.' }
      ],
      quiz: [
        {
          question: 'What is the primary benefit of deploying a decoupled architecture over a traditional monolithic server?',
          options: [
            'Decoupling makes domain name registration completely free.',
            'If a compute node fails, your files and database remain securely intact on isolated, dedicated services, minimizing single points of failure.',
            'It forces websites to load exclusively on terminal interfaces.'
          ],
          correctIndex: 1,
          explanation: 'Decoupling separates roles. If an EC2 server experiences high load or crashes, S3 static assets and RDS database records remain online and unaffected.'
        },
        {
          question: 'Why does AWS strongly recommend keeping "Block Public Access" ENABLED on S3 storage buckets?',
          options: [
            'To prevent unauthorized anonymous users from accessing private data, configuration files, or database backups.',
            'Because public buckets reduce the maximum download speed of servers.',
            'To encrypt CSS styles inside the React frontend app.'
          ],
          correctIndex: 0,
          explanation: 'Keeping S3 buckets private blocks public search engine indexing and unauthorized access to secure data.'
        },
        {
          question: 'What is the role of Amazon RDS in an enterprise cloud application?',
          options: [
            'To host the HTML index pages of your frontend application.',
            'To provide a highly reliable, managed relational database server separated from compute instances, featuring automated backups.',
            'To manage local Wi-Fi router configurations.'
          ],
          correctIndex: 1,
          explanation: 'RDS isolates database engines (like Postgres or MySQL) on managed virtual assets, handling updates, replication, and standard recovery operations automatically.'
        }
      ],
      unlockedLabId: 'lab_5'
    }
  ];

  const labsList: Lab[] = [
    {
      id: 'lab_0',
      title: 'Server Runtimes & Port Mapping',
      difficulty: 'Beginner',
      category: 'Shared Hosting',
      providerName: 'Hostinger hPanel',
      providerId: 'hostinger',
      creditsReward: 30,
      description: 'Get hands-on with the absolute basics. Map a simulated DNS address to direct traffic to your first hosting workspace, create a basic index file, and verify HTTP port listener records.',
      learningOutcomes: [
        'How web traffic is routed via public IP addresses',
        'Creating a basic index.html file to serve your first response',
        'Understanding how web browsers request files over Port 80 (HTTP)'
      ],
      objectives: [
        { id: 'dns_fundamentals', text: 'Create an A-record pointing "learn-servers.local" to your server IP "203.0.113.10"', isCompleted: false },
        { id: 'index_basics', text: 'Deploy any website domain named "learn-servers.local" in Hostinger websites manager', isCompleted: false },
        { id: 'port_checked', text: 'Verify Nginx service status in the Server Metrics panel to ensure Port 80/443 is online', isCompleted: false }
      ],
      hints: [
        'Go to the "Provider Clones" tab and launch the "Hostinger hPanel" simulator interface.',
        'Navigate to the "Websites Manager" section. Create a website domain named "learn-servers.local". This automatically maps default files and configures DNS mapping entries.',
        'Check the "Server Metrics" tab in the main application menu to see if the "Nginx (Web Server)" service is currently "running" on ports 80/443. This is the background listener program that catches browser requests.'
      ]
    },
    {
      id: 'lab_1',
      title: 'Hostinger Web Launcher & MySQL',
      difficulty: 'Beginner',
      category: 'Shared Hosting',
      providerName: 'Hostinger hPanel',
      providerId: 'hostinger',
      creditsReward: 50,
      description: 'Experience the fast, visual simplicity of managed cloud shared hosting. Set up a brand new domain name, deploy a website framework, and configure SQL database storage without typing a single terminal command.',
      learningOutcomes: [
        'How managed web hosting hides server complexity',
        'Creating visual MySQL database structures in hPanel',
        'Auto-generating DNS zone A-record pointers for custom domains',
        'Installing Let\'s Encrypt SSL connection handshakes'
      ],
      objectives: [
        { id: 'web_installed', text: 'Deploy / Install any website in Hostinger websites manager', isCompleted: false },
        { id: 'mysql_created', text: 'Create at least one MySQL Database in hPanel', isCompleted: false },
        { id: 'ssl_issued', text: 'Issue Let\'s Encrypt SSL certificate for your active domain', isCompleted: false }
      ],
      hints: [
        'Go to the "Provider Clones" tab and enter the "Hostinger hPanel" environment.',
        'Navigate to the "Websites Manager" screen, type any custom domain name (e.g. "my-awesome-blog.com"), select "WordPress" or "NodeJS", and click "Install Application". This simulates full system folder provisioning and writes default files.',
        'Navigate to the "Databases (MySQL)" screen, enter a Database name, DB User name, and a password, then click "Create MySQL database". This creates virtual tables linked in your hosting package.',
        'Navigate to the "SSL Certificates" screen, find your newly created website domain in the table list, and click "Install SSL". This initiates the simulated Let\'s Encrypt challenge-response handshake to enable secure HTTPS.'
      ]
    },
    {
      id: 'lab_2',
      title: 'cPanel Domain Zones & Cron Automations',
      difficulty: 'Beginner',
      category: 'Shared Hosting',
      providerName: 'cPanel Classic',
      providerId: 'cpanel',
      creditsReward: 50,
      description: 'Master cPanel—the absolute titan of traditional hosting platforms found in 90% of legacy web servers. Learn to configure custom DNS mapping records, manage raw directory file systems, and schedule cron tabs to run script files on precise cycles.',
      learningOutcomes: [
        'Navigating the classic, category-based cPanel grid system',
        'Scheduling background tasks with standard 5-field cron syntax',
        'Mapping DNS MX and TXT zones for secure e-mail transport',
        'Using visual File Managers to create and edit index assets'
      ],
      objectives: [
        { id: 'subdomain_mapped', text: 'Map an active subdomain inside the Domains editor', isCompleted: false },
        { id: 'postgres_db_ready', text: 'Setup a Postgres database named "hostlab_db" with user "host_admin" assigned', isCompleted: false },
        { id: 'cron_scheduled', text: 'Schedule a Crontab task to run: "bash /home/student/api/backup.sh"', isCompleted: false }
      ],
      hints: [
        'Go to the "Provider Clones" tab and launch the "cPanel Shared Hosting" environment.',
        'To map a subdomain: click the "Domains & Subdomains" left menu option. Type a custom subdomain (e.g. "api.hostlab.local") and click "Create Subdomain". This binds an A-record under the parent DNS zone.',
        'To configure databases: go to "Databases (Postgres)". Create a database named "hostlab_db", then create a database user named "host_admin" on the same page. Finally, map them together in the "Assign User Access to Database" form by choosing "hostlab_db" and "host_admin" and clicking "Grant Privileges".',
        'To schedule cron automations: go to "Cron Jobs Scheduler". Keep the time intervals as defaults (e.g. "*" or specific values), enter the command: "bash /home/student/api/backup.sh" into the CLI Command input, and click "Schedule". This appends the job to the virtual crontab daemon.'
      ]
    },
    {
      id: 'lab_3',
      title: 'Contabo Out-of-Band VNC & OS Re-imaging',
      difficulty: 'Intermediate',
      category: 'VPS Management',
      providerName: 'Contabo VPS',
      providerId: 'contabo',
      creditsReward: 100,
      description: 'Step into the shoes of a raw unmanaged virtual private server (VPS) administrator. Practice performing hardware cold reboots on frozen kernel modules, wipe and reinstall clean Rocky Linux operating system disks, and use secure out-of-band VNC graphics to log into a system with offline ports.',
      learningOutcomes: [
        'Differentiating between Soft OS Graceful Shutdowns and Hard Power Resets',
        'Re-imaging hypervisor volume slices to fresh Rocky Linux images',
        'Allocating multiple IP routing bindings to network interfaces',
        'Accessing out-of-band VNC VTY terminals for debugging offline nodes'
      ],
      objectives: [
        { id: 'hard_reboot_done', text: 'Perform a Hard Power Reboot to clear dirty VM sockets', isCompleted: false },
        { id: 'os_reinstalled_rocky', text: 'Re-image your primary container OS to "Rocky Linux 9.4"', isCompleted: false },
        { id: 'ip_ordered_bound', text: 'Order and bind an additional public IP routing address', isCompleted: false }
      ],
      hints: [
        'Go to the "Provider Clones" tab and enter the "Contabo VPS Panel" environment.',
        'To perform a Hard Power Reboot: navigate to "Power Control" and click the "Hard Reboot (Power Reset)" button. This sends an instant virtual hardware power cycle signal.',
        'To re-image the OS: go to "Reinstall OS". Change the operating system image selection dropdown to "Rocky Linux 9.4". Input a root password (e.g. "rocky_secure_2026") and click "Install Image". Wait for the progress bar to complete. *Warning: This re-images your virtual container disks!*',
        'To order and bind an additional IP: go to "IP Management" and click the "Order Additional IP Address" button. This dynamically allocates a second IPv4 address (like "203.0.113.11") and binds it to network interface eth0:1.'
      ]
    },
    {
      id: 'lab_4',
      title: 'DigitalOcean Droplets & Docker Templates',
      difficulty: 'Intermediate',
      category: 'VPS Management',
      providerName: 'DigitalOcean',
      providerId: 'digitalocean',
      creditsReward: 100,
      description: 'Spin up cloud VPS servers on-demand with DigitalOcean. Master Droplet configuration wizards, deploy optimized pre-built templates containing Docker engine dependencies, and use SSH command lines to verify container installations.',
      learningOutcomes: [
        'Sizing virtual hardware templates based on developer billing budgets',
        'Deploying marketplace template stacks (Docker on Ubuntu)',
        'Managing background container instances using terminal tools',
        'Establishing public floating IPv4 endpoint routers'
      ],
      objectives: [
        { id: 'droplet_created_docker', text: 'Create a Droplet using the "Docker on Ubuntu" image template', isCompleted: false },
        { id: 'premium_size_selected', text: 'Allocate a "Premium Intel" size layout to your droplet', isCompleted: false },
        { id: 'droplet_status_active', text: 'Ensure the newly launched droplet status changes to "active"', isCompleted: false }
      ],
      hints: [
        'Navigate to the "Provider Clones" tab and enter the "DigitalOcean Droplets" environment.',
        'Click the "Create Droplet (Wizard)" submenu tab.',
        'Choose "Docker on Ubuntu" in the Marketplace Stack templates section.',
        'Under the "Choose Plan Size" grid, click the middle "Premium Intel ($12/mo - 2GB RAM / 2 vCPU)" option.',
        'Review the default droplet name, input any password (or leave as default), and click the blue "Create Droplet" button. Monitor the virtual cloud-init progress bar until the Droplet is fully booted and active with its newly mapped IP!'
      ]
    },
    {
      id: 'lab_5',
      title: 'AWS Enterprise Decoupling & S3 Security Policies',
      difficulty: 'Advanced',
      category: 'Cloud Operations',
      providerName: 'AWS Console',
      providerId: 'aws',
      creditsReward: 200,
      description: 'Design and audit scalable, decoupled enterprise architectures in Amazon Web Services. Launch compute-optimized EC2 VM servers, establish private relational database clusters in RDS, and write strict public block policies to secure static file storage S3 Buckets.',
      learningOutcomes: [
        'Applying architectural decoupling (separating compute, database, and storage)',
        'Securing S3 storage buckets by configuring strict Public Access blocks',
        'Provisioning unmanaged RDS relational databases (PostgreSQL engine)',
        'Associating security groups and firewall firewalls to active VM nodes'
      ],
      objectives: [
        { id: 'ec2_running', text: 'Launch a "t3.micro" EC2 compute instance with status "running"', isCompleted: false },
        { id: 's3_private', text: 'Create an S3 Bucket with public access blocked (Private storage bucket)', isCompleted: false },
        { id: 'rds_postgres', text: 'Provision an RDS database node running a "PostgreSQL" engine', isCompleted: false }
      ],
      hints: [
        'Open the "Provider Clones" tab and select the "AWS Console" environment.',
        'To launch an EC2 instance: go to "EC2 Instances" left menu. Set Instance Type to "t3.micro", name it whatever you like, and click "Launch Instance". It will deploy a virtual micro VM with security firewall rules attached.',
        'To create a private S3 bucket: go to the "S3 Buckets" left menu. Enter a unique bucket name, ensure the checkbox "Block Public Access (Recommended)" is CHECKED, and click "Create Bucket". This ensures static asset paths are private.',
        'To provision RDS PostgreSQL: go to "RDS Databases". Set DB Engine to "PostgreSQL" in the form and click "Create Database Instance". It will initialize a high-availability AWS endpoint.'
      ]
    },
    {
      id: 'lab_6',
      title: 'Docker Container Web Server Deployment',
      difficulty: 'Intermediate',
      category: 'VPS Management',
      providerName: 'DigitalOcean',
      providerId: 'digitalocean',
      creditsReward: 80,
      description: 'Deploy a lightweight, containerized Nginx web server inside a DigitalOcean virtual machine. Master launching SSH terminals, verifying process container layers, and confirming port bindings.',
      learningOutcomes: [
        'Managing container virtualization layers using Docker CLI tools',
        'Binding containerized ports to public network interfaces',
        'Inspecting running host containers inside remote environments'
      ],
      objectives: [
        { id: 'droplet_created_with_name', text: 'Launch a Droplet named "docker-app" using any image template', isCompleted: false },
        { id: 'droplet_console_opened', text: 'Open the out-of-band SSH interactive terminal console for your droplet', isCompleted: false },
        { id: 'docker_nginx_launched', text: 'Execute "docker run nginx" inside your droplet console to spin up Nginx', isCompleted: false }
      ],
      hints: [
        'Go to the "Provider Clones" tab and select the "DigitalOcean Droplets" dashboard.',
        'Click "Create Droplet (Wizard)" and set the droplet hostname to exactly "docker-app", then click the blue "Create Droplet" button.',
        'Once active, click the "Launch Console" button next to your "docker-app" droplet to connect to its root terminal session.',
        'In the terminal console, type: "docker run nginx" and press Enter. This downloads the official Nginx container image and starts it on port 80.'
      ]
    }
  ];

  // Perform validation on current virtual states
  const runVerificationCheck = (labId: string) => {
    setIsVerifying(labId);

    setTimeout(() => {
      const results: Record<string, boolean> = {};
      let allPassed = true;

      if (labId === 'lab_0') {
        const hasLearnServersDns = state.dnsRecords.some(r => 
          r.name === 'learn-servers.local' && r.type === 'A' && r.value === '203.0.113.10'
        );
        results['dns_fundamentals'] = hasLearnServersDns;

        const hSitesRaw = localStorage.getItem('hostinger_websites_tracker');
        const hSites = hSitesRaw ? JSON.parse(hSitesRaw) : [];
        const hasLearnServersWeb = hSites.some((w: any) => w.domain === 'learn-servers.local');
        results['index_basics'] = hasLearnServersWeb;

        const hasNginxOnline = state.services.nginx === 'running';
        results['port_checked'] = hasNginxOnline;

        allPassed = hasLearnServersDns && hasLearnServersWeb && hasNginxOnline;
      }
      else if (labId === 'lab_1') {
        const customDns = state.dnsRecords.some(r => 
          r.name !== 'hostlab.local' && r.name !== 'api.hostlab.local' && r.type === 'A'
        );
        const hSitesRaw = localStorage.getItem('hostinger_websites_tracker');
        const hSitesLength = hSitesRaw ? JSON.parse(hSitesRaw).length : 0;
        const hasWebInstalled = customDns || hSitesLength > 0 || state.dnsRecords.length > INITIAL_DNS_LENGTH();
        results['web_installed'] = hasWebInstalled;

        const hasDb = state.cpanel.databases.length > 0;
        results['mysql_created'] = hasDb;

        const hasSsl = state.cpanel.sslCertificates.length > 0;
        results['ssl_issued'] = hasSsl;

        allPassed = hasWebInstalled && hasDb && hasSsl;
      } 
      else if (labId === 'lab_2') {
        const hasSubdomain = state.cpanel.subdomains.length > 0 || state.dnsRecords.some(r => r.name.endsWith('.hostlab.local') && r.name !== 'api.hostlab.local');
        results['subdomain_mapped'] = hasSubdomain;

        const hasDbWithUser = state.cpanel.databases.some(db => 
          db.name === 'hostlab_db' && db.users.includes('host_admin')
        );
        results['postgres_db_ready'] = hasDbWithUser;

        const hasBackupCron = state.cpanel.cronJobs.some(job => 
          job.command.includes('/api/backup.sh')
        );
        results['cron_scheduled'] = hasBackupCron;

        allPassed = hasSubdomain && hasDbWithUser && hasBackupCron;
      } 
      else if (labId === 'lab_3') {
        const hardRebooted = localStorage.getItem('contabo_hard_reboot_completed') === 'true';
        results['hard_reboot_done'] = hardRebooted;

        const activeOs = localStorage.getItem('contabo_os_image') || 'Ubuntu 24.04 LTS';
        const isRocky = activeOs.includes('Rocky Linux');
        results['os_reinstalled_rocky'] = isRocky;

        const activeIpsRaw = localStorage.getItem('contabo_assigned_ips');
        const activeIpsCount = activeIpsRaw ? JSON.parse(activeIpsRaw).length : 1;
        const hasMultipleIps = activeIpsCount > 1;
        results['ip_ordered_bound'] = hasMultipleIps;

        allPassed = hardRebooted && isRocky && hasMultipleIps;
      } 
      else if (labId === 'lab_4') {
        const dropletsRaw = localStorage.getItem('do_droplets_tracker');
        const doDroplets = dropletsRaw ? JSON.parse(dropletsRaw) : [];
        const hasDockerDroplet = doDroplets.some((d: any) => d.image.toLowerCase().includes('docker') || d.name.toLowerCase().includes('docker'));
        results['droplet_created_docker'] = hasDockerDroplet;

        const hasPremiumSize = doDroplets.some((d: any) => d.size.includes('Premium') || d.cost === 12);
        results['premium_size_selected'] = hasPremiumSize;

        const hasActiveDroplet = doDroplets.some((d: any) => d.status === 'active');
        results['droplet_status_active'] = hasActiveDroplet;

        allPassed = hasDockerDroplet && hasPremiumSize && hasActiveDroplet;
      } 
      else if (labId === 'lab_5') {
        const instancesRaw = localStorage.getItem('aws_instances_tracker');
        const awsInstances = instancesRaw ? JSON.parse(instancesRaw) : [];
        const hasRunningEc2 = awsInstances.some((i: any) => i.status === 'running' && i.type === 't3.micro');
        results['ec2_running'] = hasRunningEc2;

        const bucketsRaw = localStorage.getItem('aws_buckets_tracker');
        const awsBuckets = bucketsRaw ? JSON.parse(bucketsRaw) : [];
        const hasPrivateS3 = awsBuckets.some((b: any) => b.isPublic === false);
        results['s3_private'] = hasPrivateS3;

        const rdsRaw = localStorage.getItem('aws_rds_tracker');
        const awsRds = rdsRaw ? JSON.parse(rdsRaw) : [];
        const hasPostgresRds = awsRds.some((r: any) => r.engine === 'PostgreSQL' && r.status === 'available');
        results['rds_postgres'] = hasPostgresRds;

        allPassed = hasRunningEc2 && hasPrivateS3 && hasPostgresRds;
      }
      else if (labId === 'lab_6') {
        const dropletsRaw = localStorage.getItem('do_droplets_tracker');
        const dropletsList = dropletsRaw ? JSON.parse(dropletsRaw) : [];
        const hasDockerAppDroplet = dropletsList.some((d: any) => d.name === 'docker-app');
        results['droplet_created_with_name'] = hasDockerAppDroplet;

        results['droplet_console_opened'] = hasDockerAppDroplet;

        const hasDockerNginxRun = localStorage.getItem('do_docker_nginx_run_completed') === 'true';
        results['docker_nginx_launched'] = hasDockerNginxRun;

        allPassed = hasDockerAppDroplet && hasDockerNginxRun;
      }

      const updatedStatuses = { ...labStatuses };
      updatedStatuses[labId] = {
        completed: allPassed,
        objectives: results
      };
      setLabStatuses(updatedStatuses);
      localStorage.setItem('hostlab_labs_progress', JSON.stringify(updatedStatuses));

      setIsVerifying(null);

      const previouslyCompleted = labStatuses[labId]?.completed || false;
      if (allPassed && !previouslyCompleted) {
        const lab = labsList.find(l => l.id === labId)!;
        setJustCompletedLab(lab);
        
        const reward = lab.creditsReward;
        const nextCredits = virtualCredits + reward;
        setVirtualCredits(nextCredits);
        localStorage.setItem('hostlab_credits', nextCredits.toString());

        setShowRewardModal(true);

        addTerminalLine({ type: 'info', text: '' });
        addTerminalLine({ type: 'success', text: `🎓 HANDS-ON LAB COMPLETED: "${lab.title}"! (+${reward} Lab Credits)` });
        addTerminalLine({ type: 'success', text: `You have successfully configured virtual server topologies inside ${lab.providerName}.` });
        addTerminalLine({ type: 'info', text: '' });
      } else if (!allPassed) {
        alert('Verification Failed. Some objectives have not been completed yet. Please read the Hints section to learn how to fulfill the requirements!');
      } else {
        alert('Verification Succeeded! You have already claimed the credits for this practice laboratory.');
      }
    }, 1500);
  };

  const INITIAL_DNS_LENGTH = () => {
    return 3;
  };

  // Sync statuses from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('hostlab_labs_progress');
    if (saved) {
      try {
        setLabStatuses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const activeLab = labsList.find(l => l.id === activeLabId) || labsList[0];
  const activeStatus = labStatuses[activeLab.id] || { completed: false, objectives: {} };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-glow-emerald/10';
      case 'Intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-glow-rose/10';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // QUIZ SUBMISSION ENGINE
  const handleQuizAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
    setQuizError(null);
  };

  const submitQuizAnswers = (course: AcademyCourse) => {
    // Validate that all questions are answered
    const unansweredCount = course.quiz.filter((_, idx) => userQuizAnswers[idx] === undefined).length;
    if (unansweredCount > 0) {
      setQuizError(`Please answer all ${course.quiz.length} questions before submitting!`);
      return;
    }

    // Grade
    let score = 0;
    course.quiz.forEach((q, idx) => {
      if (userQuizAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === course.quiz.length) {
      // Passed with honors (100% score)
      const prevPassed = completedQuizzes[course.id];
      if (!prevPassed) {
        const nextCompleted = { ...completedQuizzes, [course.id]: true };
        setCompletedQuizzes(nextCompleted);
        localStorage.setItem('hostlab_completed_quizzes', JSON.stringify(nextCompleted));
        
        // Add credits
        const reward = course.creditsReward;
        const nextCredits = virtualCredits + reward;
        setVirtualCredits(nextCredits);
        localStorage.setItem('hostlab_credits', nextCredits.toString());

        // Display certificate modal!
        setCertCourse(course);
        setShowCertificateModal(true);

        addTerminalLine({ type: 'info', text: '' });
        addTerminalLine({ type: 'success', text: `🎓 ACADEMY GRADUATE: Passed "${course.title}" Quiz! (+${reward} Bonus Credits)` });
        addTerminalLine({ type: 'info', text: '' });
      }
    }
  };

  const resetQuiz = () => {
    setUserQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizError(null);
  };

  const activeCourse = coursesList.find(c => c.id === activeCourseId) || coursesList[0];
  const isCourseGraduated = completedQuizzes[activeCourse.id] || false;

  return (
    <div className="flex flex-col gap-5 h-full min-h-0 select-none" id="labs-root-view">
      
      {/* SECTION 1: CORE HEADING WITH PROGRESS OVERVIEW */}
      <div className="bg-[#0c0d12] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-5 select-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-yellow-500/10">
            <GraduationCap className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white font-display tracking-tight uppercase flex items-center gap-2">
              Academy & Practice Labs Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {viewMode === 'academy' 
                ? 'Master structural concepts, complete theory courses, and earn credentials.'
                : 'Connect virtual nodes and troubleshoot active server environments.'
              }
            </p>
          </div>
        </div>

        {/* DOUBLE BUTTON CHANGER */}
        <div className="flex items-center bg-[#050507] p-1.5 rounded-xl border border-white/5 shrink-0 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setViewMode('academy')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'academy'
                ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 1. Academy Theory
          </button>
          
          <button
            onClick={() => setViewMode('labs')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'labs'
                ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/10'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Award className="w-4 h-4" /> 2. Hands-on Labs
          </button>
        </div>

        {/* ACADEMY SCORE */}
        <div className="flex items-center gap-3 bg-[#111218] border border-white/5 rounded-xl px-4 py-2.5">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase tracking-widest">Active Balance</span>
            <strong className="text-yellow-400 text-sm font-black font-mono tracking-tight">{virtualCredits} Credits</strong>
          </div>
          <div className="h-6 w-px bg-white/15"></div>
          <div className="text-left">
            <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase tracking-widest">Graduated</span>
            <strong className="text-white text-sm font-black font-mono tracking-tight">
              {Object.keys(completedQuizzes).length} / {coursesList.length}
            </strong>
          </div>
        </div>
      </div>

      {/* VIEWPORT 1: INTERACTIVE ACADEMY THEORETICAL COURSES */}
      {viewMode === 'academy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0" id="academy-view-container">
          
          {/* COURSE SYLLABUS LISTING SIDEBAR */}
          <div className="lg:col-span-4 flex flex-col bg-[#0c0d12] border border-white/5 rounded-xl overflow-hidden h-full shadow-2xl">
            <div className="p-4 border-b border-white/5 bg-[#08080c]/60">
              <h2 className="font-bold text-white font-display text-xs uppercase tracking-wider">Theory Course Syllabus</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Learn fundamental hosting blueprints</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {coursesList.map((course) => {
                const isActive = course.id === activeCourseId;
                const isPassed = completedQuizzes[course.id] || false;
                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      setActiveCourseId(course.id);
                      setActiveSlideIndex(0);
                      setActiveCourseSubTab('lessons');
                      resetQuiz();
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-yellow-500/[0.04] border-yellow-500/30 text-yellow-300 shadow-lg shadow-yellow-500/[0.02]'
                        : 'bg-[#050507]/40 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest">
                        {course.category}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${course.badgeColor}`}>
                        {course.difficulty}
                      </span>
                    </div>

                    <h3 className={`font-extrabold text-sm mb-1.5 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 font-mono">
                      <span className="text-[10px] text-slate-500">
                        {course.slides.length} Lessons
                      </span>

                      {isPassed ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Certified
                        </span>
                      ) : (
                        <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> +{course.creditsReward} Creds
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE COURSE VIEWER AND LESSON DESK */}
          <div className="lg:col-span-8 flex flex-col bg-[#0c0d12] border border-white/5 rounded-xl overflow-hidden h-full shadow-2xl relative">
            
            {/* SUB-TAB NAVIGATOR (LESSONS / GLOSSARY / QUIZ) */}
            <div className="p-4 bg-[#08080c]/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-yellow-400 animate-pulse" />
                <div>
                  <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Currently Studying</span>
                  <h2 className="font-extrabold text-white text-sm uppercase tracking-tight">{activeCourse.title}</h2>
                </div>
              </div>

              <div className="flex items-center bg-[#050507] p-1 rounded-lg border border-white/5 shadow-inner">
                <button
                  onClick={() => setActiveCourseSubTab('lessons')}
                  className={`px-3 py-1.5 rounded text-xs font-bold tracking-wide cursor-pointer transition-all ${
                    activeCourseSubTab === 'lessons'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'text-slate-400 border border-transparent hover:text-slate-200'
                  }`}
                >
                  Lessons
                </button>
                <button
                  onClick={() => setActiveCourseSubTab('glossary')}
                  className={`px-3 py-1.5 rounded text-xs font-bold tracking-wide cursor-pointer transition-all ${
                    activeCourseSubTab === 'glossary'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'text-slate-400 border border-transparent hover:text-slate-200'
                  }`}
                >
                  Glossary
                </button>
                <button
                  onClick={() => setActiveCourseSubTab('quiz')}
                  className={`px-3 py-1.5 rounded text-xs font-bold tracking-wide cursor-pointer transition-all relative ${
                    activeCourseSubTab === 'quiz'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'text-slate-400 border border-transparent hover:text-slate-200'
                  }`}
                >
                  Review Quiz
                  {isCourseGraduated && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0d0d12]"></span>
                  )}
                </button>
              </div>
            </div>

            {/* MAIN CONTENT DISPLAY AREA */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              
              {/* SUB-TAB: ACTIVE LESSON SLIDER */}
              {activeCourseSubTab === 'lessons' && (
                <div className="space-y-5">
                  
                  {/* LESSON STEP INDICATOR */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-sans">
                      Lesson {activeSlideIndex + 1} of {activeCourse.slides.length}: {activeCourse.slides[activeSlideIndex].title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Step {activeSlideIndex + 1} / {activeCourse.slides.length}
                    </span>
                  </div>

                  {/* HIGH-CONTRAST VISUAL TEXT-BASED ILLUSTRATION CONTAINER */}
                  <div className="bg-[#050507] border border-white/5 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed select-text shadow-inner">
                    {activeCourse.slides[activeSlideIndex].illustration}
                  </div>

                  {/* INTUITIVE EXPLANATION CONTAINER */}
                  <div className="bg-[#101116] border border-white/5 rounded-xl p-4.5 space-y-3.5 shadow-md">
                    <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Lightbulb className="w-4.5 h-4.5" /> Concept Breakdown
                    </h3>
                    
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {activeCourse.slides[activeSlideIndex].concept}
                    </p>

                    <div className="p-3.5 bg-white/[0.01] border-l-2 border-yellow-500 rounded-r-lg space-y-1">
                      <strong className="text-xs text-slate-200 block font-display tracking-wide font-bold">
                        {activeCourse.slides[activeSlideIndex].analogyTitle}
                      </strong>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {activeCourse.slides[activeSlideIndex].analogyText}
                      </p>
                    </div>
                  </div>

                  {/* KEY LEARNING BULLETS */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider">Critical Takeaways</h4>
                    <div className="space-y-2">
                      {activeCourse.slides[activeSlideIndex].keyPoints.map((point, idx) => (
                        <div key={idx} className="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex items-start gap-2.5">
                          <div className="w-4.5 h-4.5 rounded-full bg-yellow-500/15 text-yellow-400 flex items-center justify-center shrink-0 font-mono text-[10px] font-black mt-0.5">
                            ✔
                          </div>
                          <span className="text-xs text-slate-300 font-medium leading-relaxed font-sans">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LESSON NAVIGATION FOOTER */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeSlideIndex === 0}
                      className="px-4 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold rounded-lg cursor-pointer flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed select-none"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous Lesson
                    </button>

                    {activeSlideIndex < activeCourse.slides.length - 1 ? (
                      <button
                        onClick={() => setActiveSlideIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 select-none shadow-glow-yellow/5"
                      >
                        Next Lesson <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveCourseSubTab('quiz')}
                        className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-black rounded-lg cursor-pointer flex items-center gap-1.5 uppercase tracking-wide select-none shadow-glow-yellow/10"
                      >
                        Take Course Quiz <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* SUB-TAB: TECHNICAL GLOSSARY TERMS */}
              {activeCourseSubTab === 'glossary' && (
                <div className="space-y-4">
                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl flex items-start gap-3.5">
                    <FileText className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-tight">Syllabus Dictionary Reference</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                        Use this dictionary directory lookup to study essential acronyms, protocols, and variables before performing administrative operations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {activeCourse.glossary.map((g, idx) => (
                      <div key={idx} className="bg-[#101116] border border-white/5 p-4 rounded-xl space-y-2 shadow-md">
                        <strong className="text-xs font-mono font-black text-yellow-400 uppercase tracking-wider block border-b border-white/5 pb-1.5">
                          {g.term}
                        </strong>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">
                          {g.definition}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-5 text-center">
                    <button
                      onClick={() => setActiveCourseSubTab('lessons')}
                      className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Return to interactive lessons
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB: GRADUATION REVIEW QUIZ */}
              {activeCourseSubTab === 'quiz' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between bg-[#08080c]/80 border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h3 className="text-xs font-extrabold text-white uppercase tracking-tight">Course Certification Exam</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Answer all questions with 100% accuracy to earn a certificate.</p>
                      </div>
                    </div>
                    {isCourseGraduated && (
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                        ★ Passed Honors
                      </span>
                    )}
                  </div>

                  {quizError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg font-bold">
                      {quizError}
                    </div>
                  )}

                  {/* QUESTIONS CONTAINER */}
                  <div className="space-y-5">
                    {activeCourse.quiz.map((q, qIdx) => {
                      const selectedOpt = userQuizAnswers[qIdx];
                      return (
                        <div key={qIdx} className="bg-[#101116] border border-white/5 p-5 rounded-xl space-y-4 shadow-md">
                          <h4 className="text-xs font-bold text-slate-100 font-sans leading-relaxed flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center shrink-0 font-mono text-[10px] text-slate-400 font-bold">
                              Q{qIdx + 1}
                            </span>
                            <span>{q.question}</span>
                          </h4>

                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedOpt === oIdx;
                              const isCorrect = q.correctIndex === oIdx;
                              
                              let buttonStyles = 'bg-[#050507]/40 border-white/5 text-slate-300 hover:bg-white/[0.02] hover:border-white/10';
                              
                              if (quizSubmitted) {
                                if (isSelected) {
                                  buttonStyles = isCorrect 
                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300 font-semibold'
                                    : 'bg-rose-500/10 border-rose-500/35 text-rose-300 font-semibold';
                                } else if (isCorrect) {
                                  buttonStyles = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
                                } else {
                                  buttonStyles = 'bg-[#050507]/20 border-white/5 text-slate-500 opacity-50';
                                }
                              } else if (isSelected) {
                                buttonStyles = 'bg-yellow-500/5 border-yellow-500/35 text-yellow-300 font-semibold';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizAnswerSelect(qIdx, oIdx)}
                                  className={`w-full text-left p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${buttonStyles}`}
                                >
                                  <div className="shrink-0 mt-0.5">
                                    {isSelected ? (
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                        quizSubmitted 
                                          ? isCorrect ? 'bg-emerald-500 border-transparent text-black' : 'bg-rose-500 border-transparent text-black'
                                          : 'bg-yellow-500 border-transparent text-black'
                                      }`}>
                                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-slate-600 bg-transparent"></div>
                                    )}
                                  </div>
                                  <span className="leading-relaxed font-sans">{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* EXPLANATION POPBOX */}
                          {quizSubmitted && (
                            <div className="bg-white/[0.01] border-l-2 border-slate-700 p-3.5 rounded-r-lg space-y-1">
                              <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Technical Explanation:</span>
                              <p className="text-xs text-slate-400 leading-relaxed font-sans select-text">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* QUIZ CONTROLLER FOOTER BAR */}
                  <div className="p-4 bg-[#050507] border border-white/5 rounded-xl flex items-center justify-between gap-4 select-none">
                    <div>
                      {quizSubmitted ? (
                        <div className="text-left">
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">Quiz Score</span>
                          <strong className="text-xs">
                            {quizScore === activeCourse.quiz.length ? (
                              <span className="text-emerald-400 font-black flex items-center gap-1.5 uppercase">
                                <ShieldCheck className="w-4 h-4" /> Perfect Score (Graduated!)
                              </span>
                            ) : (
                              <span className="text-rose-400 font-black uppercase">
                                Score: {quizScore} / {activeCourse.quiz.length} (Requires {activeCourse.quiz.length}/{activeCourse.quiz.length})
                              </span>
                            )}
                          </strong>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-sans">Submit answers to grade and earn credits.</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {quizSubmitted && quizScore < activeCourse.quiz.length && (
                        <button
                          onClick={resetQuiz}
                          className="px-4 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-slate-300 font-bold rounded-lg cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                        >
                          Retry Quiz
                        </button>
                      )}

                      {!quizSubmitted ? (
                        <button
                          onClick={() => submitQuizAnswers(activeCourse)}
                          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-lg cursor-pointer flex items-center gap-1.5 uppercase tracking-wide shadow-glow-yellow/10"
                        >
                          Submit Answers <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : quizScore === activeCourse.quiz.length ? (
                        <button
                          onClick={() => {
                            setCertCourse(activeCourse);
                            setShowCertificateModal(true);
                          }}
                          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg cursor-pointer flex items-center gap-1.5 uppercase tracking-wide shadow-glow-emerald/10"
                        >
                          View Certificate <Award className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* NEXT PROGRESS CALL-TO-ACTION */}
                  {isCourseGraduated && (
                    <div className="bg-gradient-to-r from-emerald-500/[0.04] to-yellow-500/[0.04] border border-emerald-500/25 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5 mt-4">
                      <div className="text-left">
                        <span className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-wider block">🎓 Next Step: Practical Application</span>
                        <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">Now Ready to solve the hands-on lab!</h4>
                        <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
                          You have fully conceptualized the theoretical building blocks! Launch the unmanaged sandbox environment now to configure actual servers.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          // Find corresponding lab
                          const targetLab = labsList.find(l => l.id === activeCourse.unlockedLabId) || labsList[0];
                          setActiveLabId(targetLab.id);
                          setViewMode('labs');
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shadow-glow-yellow/15 shrink-0"
                      >
                        Launch Practice Lab <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* VIEWPORT 2: THE ORIGINAL OBJECTIVES LAB TASKS */}
      {viewMode === 'labs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0" id="labs-view-container">
          
          {/* LEFT PANEL: Laboratories List Selector */}
          <div className="lg:col-span-4 flex flex-col bg-[#0d0d12] border border-white/5 rounded-xl overflow-hidden h-full shadow-2xl">
            <div className="p-4 border-b border-white/5 bg-[#0a0a0c]/40 flex justify-between items-center select-none">
              <div>
                <h2 className="font-bold text-white font-display tracking-tight text-sm uppercase">PRACTICE LABS LIST</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Hands-on infrastructure milestones</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {labsList.map((lab) => {
                const isActive = lab.id === activeLabId;
                const completed = labStatuses[lab.id]?.completed || false;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      setActiveLabId(lab.id);
                      setExpandedHint(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-yellow-500/[0.05] border-yellow-500/35 text-yellow-300 shadow-glow-yellow/5'
                        : 'bg-[#050507]/40 border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className={`w-4 h-4 ${isActive ? 'text-yellow-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                          {lab.category}
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${getDifficultyColor(lab.difficulty)}`}>
                        {lab.difficulty}
                      </span>
                    </div>

                    <h3 className={`font-semibold text-sm truncate mb-1 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {lab.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2.5 leading-relaxed">
                      {lab.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wide">
                        Target: {lab.providerName}
                      </span>
                      
                      <div className="flex items-center gap-1 font-mono">
                        {completed ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-yellow-400 flex items-center gap-1">
                            <Circle className="w-3.5 h-3.5 fill-yellow-500/10" /> +{lab.creditsReward} Creds
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Interactive Active Lab Viewport */}
          <div className="lg:col-span-8 flex flex-col bg-[#0d0d12] border border-white/5 rounded-xl overflow-hidden h-full shadow-2xl">
            <div className="p-4 bg-[#0a0a0c]/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Active Practices</span>
                  <h2 className="font-bold text-white tracking-tight text-sm uppercase">{activeLab.title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold px-2.5 py-1 rounded font-mono">
                  Reward: {activeLab.creditsReward} Lab Credits
                </span>
                <span className={`text-[10px] uppercase font-mono border px-2 py-1 rounded font-bold ${getDifficultyColor(activeLab.difficulty)}`}>
                  {activeLab.difficulty}
                </span>
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {/* Lab Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">Core Challenge Description</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#050507]/40 p-4 border border-white/5 rounded-xl">
                  {activeLab.description}
                </p>
              </div>

              {/* Learning Outcomes */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">Core Concepts Covered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeLab.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="bg-white/[0.01] border border-white/5 p-3 rounded-lg flex items-start gap-2.5">
                      <div className="w-4.5 h-4.5 rounded bg-yellow-500/10 flex items-center justify-center shrink-0 text-yellow-400 font-mono text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-slate-400 font-medium leading-normal">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LAB OBJECTIVES VERIFICATION LIST */}
              <div className="bg-[#050507]/60 border border-white/5 rounded-xl p-4.5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-yellow-400" /> Laboratory Milestones checklist
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">Real-time status</span>
                </div>

                <div className="space-y-3">
                  {activeLab.objectives.map((obj) => {
                    const isPassed = activeStatus.objectives[obj.id] || false;
                    return (
                      <div 
                        key={obj.id} 
                        className={`flex items-start justify-between p-3 rounded-lg border transition-all ${
                          isPassed 
                            ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-glow-emerald/2' 
                            : 'bg-white/[0.01] border-white/5'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isPassed ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[#08080a]">
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600 bg-transparent flex items-center justify-center shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs leading-normal ${isPassed ? 'text-slate-200 line-through opacity-70' : 'text-slate-300 font-medium'}`}>
                            {obj.text}
                          </span>
                        </div>

                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                          isPassed 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold' 
                            : 'bg-white/5 border-transparent text-slate-500'
                        }`}>
                          {isPassed ? 'Fulfilled' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Launch Environment Call-to-Action */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">Sandbox workspace:</span>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Launch the virtual {activeLab.providerName} clone sandbox to practice and execute these milestones.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('providers');
                      setActiveProvider(activeLab.providerId);
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 text-[#08080a] font-bold px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-glow-yellow/10 hover:opacity-90 transition-all uppercase tracking-wider shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#08080a]" /> Launch Sandbox Simulator
                  </button>
                </div>
              </div>

              {/* STUCK? HINTS SYSTEM ACCORDION */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" /> Stuck? Step-by-Step Training Guidelines
                </h3>

                <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 bg-[#050507]/20">
                  {activeLab.hints.map((hint, idx) => {
                    const isExpanded = expandedHint === idx;
                    return (
                      <div key={idx} className="transition-colors hover:bg-white/[0.01]">
                        <button
                          onClick={() => setExpandedHint(isExpanded ? null : idx)}
                          className="w-full text-left p-3.5 flex justify-between items-center text-xs text-slate-300 font-sans font-semibold cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-slate-500 font-mono text-[10px]">GUIDE #{idx + 1}:</span>
                            <span>{idx === 0 ? 'Initial Connection Setup' : idx === 1 ? 'Core Implementation Phase' : idx === 2 ? 'Security & Database Setup' : 'Final Validation Check'}</span>
                          </span>
                          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <p className="p-4 bg-[#050507]/40 text-xs text-slate-400 leading-relaxed font-sans border-t border-white/5 select-text">
                                {hint}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* VERIFICATION BAR */}
            <div className="p-4 bg-[#0a0a0c]/85 border-t border-white/5 flex justify-between items-center select-none shrink-0">
              <div className="text-left font-mono text-[11px] text-slate-500">
                {activeStatus.completed ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Verified Pass
                  </span>
                ) : (
                  <span>Status: <strong className="text-yellow-400 font-semibold">Incomplete</strong></span>
                )}
              </div>

              <button
                onClick={() => runVerificationCheck(activeLab.id)}
                disabled={isVerifying !== null}
                className={`font-bold px-5 py-2.5 rounded-lg text-xs cursor-pointer inline-flex items-center gap-1.5 transition-all uppercase tracking-wide border ${
                  activeStatus.completed
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : isVerifying === activeLab.id
                      ? 'bg-white/5 border-transparent text-slate-400'
                      : 'bg-yellow-500 hover:bg-yellow-400 border-transparent text-[#08080a] shadow-glow-yellow/10'
                }`}
              >
                {isVerifying === activeLab.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying Nodes...
                  </>
                ) : activeStatus.completed ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Re-Verify Success
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" /> Verify Lab Solution
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ================= EXTRA HIGH-FIDELITY REWARD POPUP MODAL ================= */}
      <AnimatePresence>
        {showRewardModal && justCompletedLab && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d0d12] border border-yellow-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl text-center relative p-6 space-y-5"
            >
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-yellow-500/[0.08] to-transparent rounded-full blur-2xl pointer-events-none"></div>

              <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/35 flex items-center justify-center mx-auto text-yellow-400 shadow-glow-yellow">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-1.5 relative">
                <span className="text-[10px] font-mono text-yellow-400 font-black uppercase tracking-widest block">Laboratory Verified Pass</span>
                <h2 className="text-xl font-black text-white font-display tracking-tight uppercase">CONGRATULATIONS!</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
                  You have successfully solved the <strong>{justCompletedLab.title}</strong> laboratory challenge and deployed standard multi-node infrastructure virtual components.
                </p>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/15 p-4 rounded-xl flex items-center justify-center gap-6 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Reward</span>
                  <strong className="text-yellow-400 text-lg font-black font-mono animate-pulse">+{justCompletedLab.creditsReward}</strong>
                  <span className="text-[9px] text-slate-500 block">Credits</span>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">New Balance</span>
                  <strong className="text-slate-200 text-lg font-black font-mono">{virtualCredits}</strong>
                  <span className="text-[9px] text-slate-500 block">Lab Credits</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRewardModal(false);
                  setJustCompletedLab(null);
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-[#08080a] font-bold py-3 rounded-xl text-xs cursor-pointer transition-colors shadow-glow-yellow/10 uppercase tracking-wider"
              >
                Claim Lab Credits
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= HIGH-FIDELITY GRADUATION CERTIFICATE POPUP MODAL ================= */}
      <AnimatePresence>
        {showCertificateModal && certCourse && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 z-50 select-none">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-[#0b0c10] border-2 border-yellow-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative p-8 text-center space-y-6"
            >
              {/* Classical Certificate Border / Graphics */}
              <div className="absolute inset-4 border border-yellow-500/10 pointer-events-none rounded-2xl"></div>
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-yellow-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-yellow-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>

              {/* Certificate Seal Badge */}
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-2xl relative z-10 mx-auto">
                  <Star className="w-9 h-9 fill-black" />
                </div>
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md animate-ping"></div>
              </div>

              {/* Certificate Text details */}
              <div className="space-y-4 relative z-10">
                <span className="text-[10px] font-mono text-yellow-400 font-black uppercase tracking-widest block">HostLab Educational Academy</span>
                
                <h2 className="text-2xl font-black text-white font-display tracking-tight uppercase border-b border-white/5 pb-4">
                  CERTIFICATE OF COMPLETION
                </h2>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">This certifies that the user has successfully graduated</span>
                  <p className="text-base font-extrabold text-white bg-white/5 px-4 py-2 rounded-xl inline-block">
                    {state.userEmail || 'Active Student Developer'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">from the course of study</span>
                  <h3 className="text-lg font-black text-yellow-300 uppercase tracking-tight">{certCourse.title}</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                  By demonstrating proficiency in structural resource division, domain routing system (DNS), database cluster management, and error repair methodologies.
                </p>
              </div>

              {/* Credential ID and rewards summary */}
              <div className="bg-yellow-500/[0.03] border border-yellow-500/15 p-4 rounded-xl flex items-center justify-between font-mono text-left relative z-10 max-w-md mx-auto text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Credential hash</span>
                  <span className="text-slate-300 font-bold font-mono">HL-{(certCourse.id).toUpperCase()}-2026</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Bonus Reward</span>
                  <span className="text-yellow-400 font-black">+{certCourse.creditsReward} Credits Earned</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  setCertCourse(null);
                }}
                className="w-full max-w-xs mx-auto bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-3 rounded-xl text-xs cursor-pointer transition-all shadow-glow-yellow/15 uppercase tracking-widest relative z-10"
              >
                Claim Certificate Award
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
