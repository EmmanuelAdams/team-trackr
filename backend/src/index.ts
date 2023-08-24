import swaggerUi from "swagger-ui-express";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import errorHandler from './middlewares/error'
import swaggerSpec from "./utils/swaggerSpec";
import morgan from "morgan";

dotenv.config();
require("./db");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`🛡  Server listening on port: ${port} 🛡`);
});
