import express from 'express';
import { query } from '../db';

const router = express.Router();

// Save snapshot
router.post('/', async (req, res) => {
  try {
    const { userId, sessionId, snapshot, label } = req.body;
    if (!userId || !snapshot) {
      return res.status(400).json({ error: 'userId and snapshot are required' });
    }

    const labelStr = label || 'auto-save';

    const insertRes = await query(
      'INSERT INTO simulator_snapshots (user_id, session_id, snapshot, label) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      [userId, sessionId || null, JSON.stringify(snapshot), labelStr]
    );

    // Keep only the last 15 auto-saves for a user to save space, delete older auto-saves
    if (labelStr === 'auto-save') {
      await query(
        `DELETE FROM simulator_snapshots 
         WHERE id IN (
           SELECT id FROM simulator_snapshots 
           WHERE user_id = $1 AND label = 'auto-save' 
           ORDER BY created_at DESC 
           OFFSET 15
         )`,
        [userId]
      );
    }

    res.status(201).json({
      success: true,
      snapshotId: insertRes.rows[0].id,
      createdAt: insertRes.rows[0].created_at,
    });
  } catch (error) {
    console.error('Save snapshot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest snapshot for user
router.get('/latest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(
      'SELECT snapshot, label, created_at FROM simulator_snapshots WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, snapshot: null });
    }

    res.json({
      success: true,
      snapshot: result.rows[0].snapshot,
      label: result.rows[0].label,
      createdAt: result.rows[0].created_at,
    });
  } catch (error) {
    console.error('Get latest snapshot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get list of checkpoints for user (non-auto-saves or manual ones)
router.get('/checkpoints/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(
      'SELECT id, label, created_at FROM simulator_snapshots WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get checkpoints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
