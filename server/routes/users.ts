import express from 'express';
import crypto from 'crypto';
import { query } from '../db';

const router = express.Router();

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) {
      return res.status(400).json({ error: 'Username and PIN are required' });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    const pinHash = hashPin(pin);

    // Check user
    const userRes = await query('SELECT * FROM users WHERE username = $1', [username.trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or PIN' });
    }

    const user = userRes.rows[0];
    if (user.pin_hash !== pinHash) {
      return res.status(401).json({ error: 'Invalid username or PIN' });
    }

    // Create session
    const sessionRes = await query(
      'INSERT INTO user_sessions (user_id) VALUES ($1) RETURNING id',
      [user.id]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        xp: user.xp,
      },
      sessionId: sessionRes.rows[0].id,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) {
      return res.status(400).json({ error: 'Username and PIN are required' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters long' });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE username = $1', [trimmedUsername]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const pinHash = hashPin(pin);

    // Create user
    const newUserRes = await query(
      'INSERT INTO users (username, pin_hash) VALUES ($1, $2) RETURNING id, username, xp',
      [trimmedUsername, pinHash]
    );
    const newUser = newUserRes.rows[0];

    // Create session
    const sessionRes = await query(
      'INSERT INTO user_sessions (user_id) VALUES ($1) RETURNING id',
      [newUser.id]
    );

    res.status(201).json({
      success: true,
      user: newUser,
      sessionId: sessionRes.rows[0].id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRes = await query('SELECT id, username, xp FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userRes.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user XP
router.post('/:id/xp', async (req, res) => {
  try {
    const { id } = req.params;
    const { xp } = req.body;
    if (typeof xp !== 'number') {
      return res.status(400).json({ error: 'XP must be a number' });
    }

    const userRes = await query(
      'UPDATE users SET xp = $1, updated_at = now() WHERE id = $2 RETURNING id, username, xp',
      [xp, id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: userRes.rows[0] });
  } catch (error) {
    console.error('Update XP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End session
router.post('/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE user_sessions SET ended_at = now() WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
