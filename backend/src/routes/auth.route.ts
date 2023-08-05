import express from 'express';
import { registerUser } from '../controllers/auth.controller';

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided details.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               level:
 *                 type: string
 *               yearsOfWork:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful registration
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerUser);

export default router;
