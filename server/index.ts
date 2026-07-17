import express from 'express';
import cors from 'cors';
import { query } from './db';
import usersRoute from './routes/users';
import snapshotsRoute from './routes/snapshots';
import missionsRoute from './routes/missions';
import historyRoute from './routes/history';
import { CORE_MISSIONS } from '../src/lib/missions';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', usersRoute);
app.use('/api/users', usersRoute);
app.use('/api/snapshots', snapshotsRoute);
app.use('/api/missions', missionsRoute);
app.use('/api/history', historyRoute);

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Dynamic DB seed function
async function seedMissionsAndObjectives() {
  console.log('Syncing missions and objectives with database...');
  try {
    // 1. Insert/update missions
    for (let index = 0; index < CORE_MISSIONS.length; index++) {
      const mission = CORE_MISSIONS[index];
      await query(
        `INSERT INTO missions (id, title, difficulty, category, ticket_number, client_name, description, ticket_message, xp_reward, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           difficulty = EXCLUDED.difficulty,
           category = EXCLUDED.category,
           ticket_number = EXCLUDED.ticket_number,
           client_name = EXCLUDED.client_name,
           description = EXCLUDED.description,
           ticket_message = EXCLUDED.ticket_message,
           xp_reward = EXCLUDED.xp_reward,
           sort_order = EXCLUDED.sort_order`,
        [
          mission.id,
          mission.title,
          mission.difficulty,
          mission.category,
          mission.ticketNumber,
          mission.clientName,
          mission.description,
          mission.ticketMessage,
          mission.xpReward,
          index,
        ]
      );

      // 2. Insert/update objectives for this mission
      for (let objIndex = 0; objIndex < mission.objectives.length; objIndex++) {
        const obj = mission.objectives[objIndex];
        await query(
          `INSERT INTO mission_objectives (id, mission_id, text, sort_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET
             mission_id = EXCLUDED.mission_id,
             text = EXCLUDED.text,
             sort_order = EXCLUDED.sort_order`,
          [obj.id, mission.id, obj.text, objIndex]
        );
      }
    }
    console.log('Missions and objectives sync completed successfully.');
  } catch (error) {
    console.error('Error seeding missions/objectives:', error);
  }
}

// Start Server
app.listen(port, async () => {
  console.log(`HostLab Express server running on port ${port}`);
  await seedMissionsAndObjectives();
});
