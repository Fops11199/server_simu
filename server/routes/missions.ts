import express from 'express';
import { query } from '../db';

const router = express.Router();

// Get progress for a user
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch mission progress
    const missionsProgress = await query(
      'SELECT mission_id, completed, completed_at, attempts FROM mission_progress WHERE user_id = $1',
      [userId]
    );

    // Fetch objective progress
    const objectivesProgress = await query(
      'SELECT objective_id, completed, completed_at FROM objective_progress WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      missions: missionsProgress.rows.map(m => ({
        id: m.mission_id,
        completed: m.completed,
        completedAt: m.completed_at,
        attempts: m.attempts,
      })),
      objectives: objectivesProgress.rows.map(o => ({
        id: o.objective_id,
        completed: o.completed,
        completedAt: o.completed_at,
      })),
    });
  } catch (error) {
    console.error('Get mission progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update mission progress
router.post('/progress', async (req, res) => {
  try {
    const { userId, missionId, completed, attempts } = req.body;
    if (!userId || !missionId) {
      return res.status(400).json({ error: 'userId and missionId are required' });
    }

    const isCompleted = !!completed;
    const completedAt = isCompleted ? new Date() : null;
    const attemptsCount = typeof attempts === 'number' ? attempts : 1;

    await query(
      `INSERT INTO mission_progress (user_id, mission_id, completed, completed_at, attempts, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (user_id, mission_id)
       DO UPDATE SET 
         completed = EXCLUDED.completed,
         completed_at = COALESCE(mission_progress.completed_at, EXCLUDED.completed_at),
         attempts = EXCLUDED.attempts,
         updated_at = now()`,
      [userId, missionId, isCompleted, completedAt, attemptsCount]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update mission progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update objective progress
router.post('/objectives/progress', async (req, res) => {
  try {
    const { userId, objectiveId, completed } = req.body;
    if (!userId || !objectiveId) {
      return res.status(400).json({ error: 'userId and objectiveId are required' });
    }

    const isCompleted = !!completed;
    const completedAt = isCompleted ? new Date() : null;

    await query(
      `INSERT INTO objective_progress (user_id, objective_id, completed, completed_at, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (user_id, objective_id)
       DO UPDATE SET 
         completed = EXCLUDED.completed,
         completed_at = COALESCE(objective_progress.completed_at, EXCLUDED.completed_at),
         updated_at = now()`,
      [userId, objectiveId, isCompleted, completedAt]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update objective progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
