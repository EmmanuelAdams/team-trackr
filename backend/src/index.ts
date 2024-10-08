import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import projectRoutes from './routes/project.route';
import taskRoutes from './routes/task.route';
import userRoutes from './routes/user.route';
import commentRoutes from './routes/comment.route';
import organizationRoutes from './routes/organization.route';
import swaggerUi from 'swagger-ui-express';
import errorHandler from './middlewares/error';
import swaggerSpec from './swaggerSpec';
import morgan from 'morgan';

dotenv.config();
require('./db');

const app = express();
const serverPort = process.env.PORT || 4000;
const testPort = 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:8080/',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/organization', organizationRoutes);

app.use(errorHandler);

const port =
  process.env.NODE_ENV === 'test' ? testPort : serverPort;

const server = app.listen(port, () => {
  console.log(`🛡  Server listening on port: ${port} 🛡`);
});

export { app, server };
