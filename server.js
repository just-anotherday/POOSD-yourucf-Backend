// Load Environment Variables
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db'); // Import the custom DB connection
const cors = require('cors');

const app = express();

// Enable CORS for all routes (Allow All Origins)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json()); // Ensure JSON requests are parsed correctly
app.use(express.urlencoded({ extended: true })); // Allow URL-encoded data

// Connect to MongoDB
connectDB()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB Connection Error:', err));

// =============================
// Routes
// =============================
app.get('/', (req, res) => {
    res.send("🚀 Server is up and running!");
});

// Load Routers
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/plans', require('./routes/planOfStudyRoutes'));
app.use('/api/foundation-exams', require('./routes/foundationExamRoutes'));
app.use('/api/degree-requirements', require('./routes/degreeRequirementRoutes'));
app.use('/api/areas', require('./routes/areaRoutes'));

// =============================
// Seed Routes Setup
// =============================
// Place seed routes last to avoid conflicts
app.use('/api', require('./routes/seedRoutes'));

// =============================
// Error Handling
// =============================

// 404 Error Handler (Catch-all for unhandled routes)
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// =============================
// Debug: List All Registered Routes
// =============================
console.log("🔍 Registered Routes:");
app._router.stack
  .filter(middleware => middleware.route || (middleware.name === 'router' && middleware.handle.stack))
  .forEach(middleware => {
      if (middleware.route) {
          console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
      } else if (middleware.handle.stack) {
          middleware.handle.stack.forEach(handler => {
              if (handler.route) {
                  console.log(`  ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
              }
          });
      }
  });

// =============================
// Start the Server
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
