import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Placeholder for cargo-specific routes
router.get('/', async (req, res) => {
  res.json({ message: 'Rutas de carga - En desarrollo' });
});

export default router;