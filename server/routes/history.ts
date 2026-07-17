import express from 'express';
import { query } from '../db';

const router = express.Router();

// Record a command execution
router.post('/', async (req, res) => {
  try {
    const { userId, sessionId, missionId, command, outcome } = req.body;
    if (!userId || !command || !outcome) {
      return res.status(400).json({ error: 'userId, command, and outcome are required' });
    }

    await query(
      `INSERT INTO command_history (user_id, session_id, mission_id, command, outcome)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, sessionId || null, missionId || null, command, outcome]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Record command history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get command history for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;

    const result = await query(
      `SELECT id, session_id, mission_id, command, outcome, executed_at 
       FROM command_history 
       WHERE user_id = $1 
       ORDER BY executed_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get command history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
