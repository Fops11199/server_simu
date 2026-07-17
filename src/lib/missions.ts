import type { Mission } from '../types/missions';
import type { SimulatorCoreState } from '../types/simulator';
import { getNodeByPath, parseNginxConfig } from '../engine';

/**
 * Core missions — data-driven: each objective carries its own validator function.
 * To add a new mission, just add a new object here. No switch statement needed.
 */
export const CORE_MISSIONS: Mission[] = [
  {
    id: 'mission_1',
    title: 'The Broken Landing Page',
    difficulty: 'Beginner',
    category: 'Terminal',
    ticketNumber: 1042,
    clientName: 'Sora Web Design',
    description: 'The client\'s default static website is displaying a 404 Not Found error. Nginx is serving from /var/www/html, but the directory is empty.',
    ticketMessage: `Hi support team!
Our main website at hostlab.local is showing a "404 Not Found" error.
Our web designer created a beautiful index.html file for us, and it is sitting in the student home directory (/home/student/index.html).
But Nginx is looking in /var/www/html and the landing page is not appearing.

Can you copy our index.html file into Nginx's default document root directory (/var/www/html/) so it displays correctly?
Please make sure the Nginx service is running after you do this. Thank you!`,
    objectives: [
      {
        id: 'obj_1_nginx',
        text: 'Ensure the Nginx service is running',
        completed: false,
        validator: (state: SimulatorCoreState) => state.services.nginx === 'running',
      },
      {
        id: 'obj_1_file',
        text: 'Copy index.html from /home/student/ to /var/www/html/',
        completed: false,
        validator: (state: SimulatorCoreState) => {
          const node = getNodeByPath(state.fs, '/var/www/html/index.html');
          return node !== null && node.type === 'file' && node.content.includes('HostLab');
        },
      },
    ],
    xpReward: 100,
    completed: false,
  },

  {
    id: 'mission_2',
    title: 'DNS Subdomain Mismatch',
    difficulty: 'Beginner',
    category: 'DNS',
    ticketNumber: 1043,
    clientName: 'AlphaTech API',
    description: 'The API subdomain api.hostlab.local resolves to a local sandbox IP (192.168.1.50) instead of the primary server IP.',
    ticketMessage: `Hello,
We just launched our API subdomain at api.hostlab.local. However, our developers are getting connection timeouts.
When we run "dig api.hostlab.local", it resolves to some internal IP 192.168.1.50.
It should be pointing to our primary public server IP: 203.0.113.10.

Could you update our DNS Zone Records in the cPanel Zone Editor or terminal to point the "api.hostlab.local" A-record to "203.0.113.10"?`,
    objectives: [
      {
        id: 'obj_2_dns',
        text: 'Update the DNS A record for api.hostlab.local to 203.0.113.10',
        completed: false,
        validator: (state: SimulatorCoreState) =>
          state.dnsRecords.some(r => r.name === 'api.hostlab.local' && r.type === 'A' && r.value === '203.0.113.10'),
      },
    ],
    xpReward: 120,
    completed: false,
  },

  {
    id: 'mission_3',
    title: 'Nginx Reverse Proxy Fix',
    difficulty: 'Intermediate',
    category: 'Nginx',
    ticketNumber: 1044,
    clientName: 'Crypton Services',
    description: 'Nginx is throwing a 502 Bad Gateway for api.hostlab.local. The reverse proxy port in Nginx default configuration is pointing to 8080 instead of 5000, and the API service is stopped.',
    ticketMessage: `Hey support,
Our Node.js API is running on port 5000 on our server, but whenever we curl http://api.hostlab.local, Nginx replies with a "502 Bad Gateway".
We checked our Nginx reverse proxy configuration block in /etc/nginx/sites-available/default. It seems the "proxy_pass" directive is forwarding requests to port 8080!
Also, we are not sure if the Node.js API service is actually running or stopped.

Could you:
1. Start the "node-api" system service?
2. Edit /etc/nginx/sites-available/default to forward proxy_pass to http://localhost:5000; instead of port 8080?
3. Restart Nginx to apply the configuration changes?

Let's get this API back online!`,
    objectives: [
      {
        id: 'obj_3_node',
        text: 'Start the node-api system service',
        completed: false,
        validator: (state: SimulatorCoreState) => state.services['node-api'] === 'running',
      },
      {
        id: 'obj_3_config',
        text: 'Change proxy_pass in Nginx config to port 5000',
        completed: false,
        validator: (state: SimulatorCoreState) => {
          const node = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
          if (!node || node.type !== 'file') return false;
          const blocks = parseNginxConfig(node.content);
          if (blocks.some(b => b.hasSyntaxError)) return false;
          const apiBlock = blocks.find(b => b.serverName.includes('api.hostlab.local'));
          const proxyVal = apiBlock?.proxies['/'] || '';
          return proxyVal.includes('5000') && !proxyVal.includes('8080');
        },
      },
      {
        id: 'obj_3_nginx',
        text: 'Restart Nginx without any syntax errors',
        completed: false,
        validator: (state: SimulatorCoreState) => state.services.nginx === 'running',
      },
    ],
    xpReward: 180,
    completed: false,
  },

  {
    id: 'mission_4',
    title: 'Secure the Connection (SSL)',
    difficulty: 'Intermediate',
    category: 'SSL',
    ticketNumber: 1045,
    clientName: 'Sora Web Design',
    description: 'Clients are receiving security warnings when visiting hostlab.local. Issue an SSL certificate to enable HTTPS.',
    ticketMessage: `Hi there!
We have our index page serving successfully now, but when users visit, their browser displays a warning: "Your connection is not private".
This is because we don't have an SSL Certificate installed for hostlab.local.

Can you issue and install a Let's Encrypt SSL certificate for "hostlab.local" using cPanel's SSL Manager (or our terminal tool)?
This will secure our site and enable HTTPS connection. Thank you!`,
    objectives: [
      {
        id: 'obj_4_ssl',
        text: 'Issue/Enable SSL certificate for hostlab.local',
        completed: false,
        validator: (state: SimulatorCoreState) =>
          state.cpanel.sslCertificates.includes('hostlab.local'),
      },
    ],
    xpReward: 110,
    completed: false,
  },

  {
    id: 'mission_5',
    title: 'Database Authentication Fail',
    difficulty: 'Advanced',
    category: 'Database',
    ticketNumber: 1046,
    clientName: 'PixelCraft CRM',
    description: 'The client\'s application cannot connect to the database. PostgreSQL is inactive, and the required database and user do not exist.',
    ticketMessage: `Hello Support,
Our new CRM application is failing to connect to the database. We get a "Database connection refused" error.
We need a clean PostgreSQL database set up on this server with these exact parameters:
1. The database service "postgresql" must be running.
2. We need a new database named "hostlab_db".
3. We need a database user named "host_admin" created and assigned/granted full permissions to "hostlab_db".

Can you configure this database environment for us using cPanel Databases or terminal?`,
    objectives: [
      {
        id: 'obj_5_service',
        text: 'Start the postgresql database service',
        completed: false,
        validator: (state: SimulatorCoreState) => state.services.postgresql === 'running',
      },
      {
        id: 'obj_5_db',
        text: 'Create a database named hostlab_db',
        completed: false,
        validator: (state: SimulatorCoreState) =>
          state.cpanel.databases.some(db => db.name === 'hostlab_db'),
      },
      {
        id: 'obj_5_user',
        text: 'Create user host_admin and assign to hostlab_db',
        completed: false,
        validator: (state: SimulatorCoreState) => {
          const userCreated = state.cpanel.dbUsers.some(u => u.username === 'host_admin');
          const assigned = state.cpanel.databases.some(
            db => db.name === 'hostlab_db' && db.users.includes('host_admin')
          );
          return userCreated && assigned;
        },
      },
    ],
    xpReward: 200,
    completed: false,
  },

  // ==========================================
  // NEW MISSIONS — unlocked by the new architecture
  // ==========================================
  {
    id: 'mission_6',
    title: 'Email Account Setup',
    difficulty: 'Beginner',
    category: 'Terminal',
    ticketNumber: 1047,
    clientName: 'BlueHarbour Consulting',
    description: 'The client needs a professional business email account created on their hosting account.',
    ticketMessage: `Hi HostLab support,
We recently signed up for your hosting and need our business email configured.
We would like the email address contact@hostlab.local created with at least 250 MB quota.

Can you set this up in the email section of the cPanel?`,
    objectives: [
      {
        id: 'obj_6_email',
        text: 'Create email account contact@hostlab.local with 250 MB+ quota',
        completed: false,
        validator: (state: SimulatorCoreState) =>
          state.cpanel.emails.some(
            e => e.address === 'contact@hostlab.local' && parseInt(e.quota) >= 250
          ),
      },
    ],
    xpReward: 80,
    completed: false,
  },

  {
    id: 'mission_7',
    title: 'Scheduled Backup Cron Job',
    difficulty: 'Intermediate',
    category: 'Terminal',
    ticketNumber: 1048,
    clientName: 'DeltaForce Media',
    description: 'The client needs a daily automated backup cron job configured to run at midnight.',
    ticketMessage: `Hello,
We need our server configured to run automated backups every day at midnight (00:00).
Please add a cron job that runs the command: /home/student/backup.sh
It should run at minute 0, hour 0, every day.

Please set this up in the cPanel Cron Jobs section.`,
    objectives: [
      {
        id: 'obj_7_cron',
        text: 'Add cron job: /home/student/backup.sh at 00:00 daily',
        completed: false,
        validator: (state: SimulatorCoreState) =>
          state.cpanel.cronJobs.some(
            j => j.command.includes('backup.sh') && j.hour === '0' && j.minute === '0'
          ),
      },
    ],
    xpReward: 130,
    completed: false,
  },
];

/**
 * Validate all non-completed missions against current simulator state.
 * Returns updated missions array with objective statuses recalculated.
 */
export function validateAllMissions(
  missions: Mission[],
  state: SimulatorCoreState
): Mission[] {
  return missions.map(mission => {
    if (mission.completed) return mission;

    // Re-attach validators from source (in case loaded from localStorage without them)
    const sourceMission = CORE_MISSIONS.find(m => m.id === mission.id);

    const updatedObjectives = mission.objectives.map((obj, idx) => {
      const validator = sourceMission?.objectives[idx]?.validator;
      const isCompleted = validator ? validator(state) : obj.completed;
      return { ...obj, completed: isCompleted };
    });

    const allCompleted = updatedObjectives.every(o => o.completed);

    return {
      ...mission,
      objectives: updatedObjectives,
      completed: allCompleted,
    };
  });
}
