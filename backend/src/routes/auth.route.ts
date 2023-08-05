import express from 'express';
import { registerUser } from '../controllers/auth.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided details.
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
 *                 enum: [Junior, Mid-level, Senior, CEO]
 *               yearsOfWork:
 *                 type: number
 *               availability:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [Available, Not Available]
 *                   reason:
 *                     type: string
 *                   nextAvailability:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User with this email already exists
 *       500:
 *         description: Internal server error
 */

router.post('/register', registerUser);

export default router;
