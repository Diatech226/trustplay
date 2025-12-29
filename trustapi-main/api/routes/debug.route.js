import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/whoami', verifyToken, (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
      tokenSource: req.tokenSource,
    },
  });
});

export default router;
