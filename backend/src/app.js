const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const donorRoutes = require('./routes/donorRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');


// Import Error Middlewares
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Global Middlewares
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle CORS before parsing requests or routing, including browser preflights.
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/requests', requestRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/camps', require('./routes/campRoutes'));
app.use('/api/issuance', require('./routes/issuanceRoutes'));
app.use('/api/commitments', require('./routes/commitmentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Blood Connect API is running...');
});

// Error Handling Middlewares (Must be registered AFTER all routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
