import { Mission, SimulatorState } from '../types';
import { getNodeByPath, parseNginxConfig } from './simulatorEngine';

export const CORE_MISSIONS: Mission[] = [
  {
    id: 'mission_1',
    title: 'The Broken Landing Page',
    difficulty: 'Beginner',
    category: 'Terminal',
    ticketNumber: 1042,
    clientName: 'Sora Web Design',
    description: 'The clients default static website is displaying a 404 Not Found error. Nginx is serving from /var/www/html, but the directory is empty.',
    ticketMessage: `Hi support team!
Our main website at hostlab.local is showing a "404 Not Found" error.
Our web designer created a beautiful index.html file for us, and it is sitting in the student home directory (/home/student/index.html).
But Nginx is looking in /var/www/html and the landing page is not appearing.

Can you copy our index.html file into Nginx's default document root directory (/var/www/html/) so it displays correctly?
Please make sure the Nginx service is running after you do this. Thank you!`,
    objectives: [
      { id: 'obj_1_nginx', text: 'Ensure the Nginx service is running', completed: false },
      { id: 'obj_1_file', text: 'Copy index.html from /home/student/ to /var/www/html/', completed: false }
    ],
    xpReward: 100,
    completed: false
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
      { id: 'obj_2_dns', text: 'Update the DNS A record for api.hostlab.local to 203.0.113.10', completed: false }
    ],
    xpReward: 120,
    completed: false
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
      { id: 'obj_3_node', text: 'Start the node-api system service', completed: false },
      { id: 'obj_3_config', text: 'Change proxy_pass in Nginx config to port 5000', completed: false },
      { id: 'obj_3_nginx', text: 'Restart Nginx without any syntax errors', completed: false }
    ],
    xpReward: 180,
    completed: false
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
      { id: 'obj_4_ssl', text: 'Issue/Enable SSL certificate for hostlab.local', completed: false }
    ],
    xpReward: 110,
    completed: false
  },
  {
    id: 'mission_5',
    title: 'Database Authentication Fail',
    difficulty: 'Advanced',
    category: 'Database',
    ticketNumber: 1046,
    clientName: 'PixelCraft CRM',
    description: 'The clients application cannot connect to the database. PostgreSQL is inactive, and the required database and user do not exist.',
    ticketMessage: `Hello Support,
Our new CRM application is failing to connect to the database. We get a "Database connection refused" error.
We need a clean PostgreSQL database set up on this server with these exact parameters:
1. The database service "postgresql" must be running.
2. We need a new database named "hostlab_db".
3. We need a database user named "host_admin" created and assigned/granted full permissions to "hostlab_db".

Can you configure this database environment for us using cPanel Databases or terminal?`,
    objectives: [
      { id: 'obj_5_service', text: 'Start the postgresql database service', completed: false },
      { id: 'obj_5_db', text: 'Create a database named hostlab_db', completed: false },
      { id: 'obj_5_user', text: 'Create user host_admin and assign to hostlab_db', completed: false }
    ],
    xpReward: 200,
    completed: false
  }
];

export function validateMission(missionId: string, state: SimulatorState): { completed: boolean; objectiveStatus: { [id: string]: boolean } } {
  const objectiveStatus: { [id: string]: boolean } = {};
  let allCompleted = true;

  switch (missionId) {
    case 'mission_1': {
      // 1. Ensure Nginx is running
      const isNginxRunning = state.services.nginx === 'running';
      objectiveStatus['obj_1_nginx'] = isNginxRunning;

      // 2. index.html copied to /var/www/html
      const fileNode = getNodeByPath(state.fs, '/var/www/html/index.html');
      const isFileCopied = fileNode !== null && fileNode.type === 'file' && fileNode.content.includes('HostLab');
      objectiveStatus['obj_1_file'] = isFileCopied;

      allCompleted = isNginxRunning && isFileCopied;
      break;
    }

    case 'mission_2': {
      // Update DNS A record for api.hostlab.local to 203.0.113.10
      const record = state.dnsRecords.find(
        r => r.name === 'api.hostlab.local' && r.type === 'A' && r.value === '203.0.113.10'
      );
      const isDnsCorrect = record !== undefined;
      objectiveStatus['obj_2_dns'] = isDnsCorrect;

      allCompleted = isDnsCorrect;
      break;
    }

    case 'mission_3': {
      // 1. node-api is running
      const isNodeRunning = state.services['node-api'] === 'running';
      objectiveStatus['obj_3_node'] = isNodeRunning;

      // 2. proxy_pass is 5000
      const nginxConfigNode = getNodeByPath(state.fs, '/etc/nginx/sites-available/default');
      let isConfigCorrect = false;
      if (nginxConfigNode && nginxConfigNode.type === 'file') {
        const blocks = parseNginxConfig(nginxConfigNode.content);
        const syntaxError = blocks.some(b => b.hasSyntaxError);
        
        // Find api.hostlab.local block and check proxies
        const apiBlock = blocks.find(b => b.serverName.includes('api.hostlab.local'));
        if (apiBlock && !syntaxError) {
          const proxyVal = apiBlock.proxies['/'] || '';
          if (proxyVal.includes('5000') && !proxyVal.includes('8080')) {
            isConfigCorrect = true;
          }
        }
      }
      objectiveStatus['obj_3_config'] = isConfigCorrect;

      // 3. Nginx is running (successfully restarted without errors)
      const isNginxRunning = state.services.nginx === 'running';
      objectiveStatus['obj_3_nginx'] = isNginxRunning;

      allCompleted = isNodeRunning && isConfigCorrect && isNginxRunning;
      break;
    }

    case 'mission_4': {
      // SSL certificate issued for hostlab.local
      const isSslEnabled = state.cpanel.sslCertificates.includes('hostlab.local');
      objectiveStatus['obj_4_ssl'] = isSslEnabled;

      allCompleted = isSslEnabled;
      break;
    }

    case 'mission_5': {
      // 1. postgresql is running
      const isPgRunning = state.services.postgresql === 'running';
      objectiveStatus['obj_5_service'] = isPgRunning;

      // 2. hostlab_db database created
      const dbExists = state.cpanel.databases.some(db => db.name === 'hostlab_db');
      objectiveStatus['obj_5_db'] = dbExists;

      // 3. host_admin created and assigned to hostlab_db
      const userCreated = state.cpanel.dbUsers.some(u => u.username === 'host_admin');
      const dbAndUserAssigned = state.cpanel.databases.some(
        db => db.name === 'hostlab_db' && db.users.includes('host_admin')
      );
      objectiveStatus['obj_5_user'] = userCreated && dbAndUserAssigned;

      allCompleted = isPgRunning && dbExists && userCreated && dbAndUserAssigned;
      break;
    }

    default:
      allCompleted = false;
  }

  return { completed: allCompleted, objectiveStatus };
}
