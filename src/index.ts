import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './config/database.js';
import { swaggerSpec } from './config/swagger.js';
import productRoutes from './routes/productRoutes.js';
import productTypeRoutes from './routes/productTypeRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Swagger Documentation
app.use('/api-docs', ...(swaggerUi.serve as any));
app.use('/api-docs', swaggerUi.setup(swaggerSpec as any, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Products API Documentation',
}) as any);

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/images', imageRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT: number = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();

export default app;
