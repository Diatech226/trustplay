import express from 'express';
import {
  forgotPassword,
  resetPassword,
  signin,
  signup,
  signout,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', signout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
