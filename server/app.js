const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('EduSpace API is running');
});

// DB
if (!mongoose.connection.readyState) {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    console.error('ATLAS_URI is not set');
  } else {
    mongoose.connect(uri);
    const connection = mongoose.connection;
    connection.once('open', () => {
      console.log('MongoDB database connection established successfully');
    });
  }
}

// Routes
const roomsRouter = require('./routes/rooms');
const usersRouter = require('./routes/users');
const bookingsRouter = require('./routes/bookings');
const authRouter = require('./routes/auth');
const resendRouter = require('./routes/resend');

app.use('/rooms', roomsRouter);
app.use('/users', usersRouter);
app.use('/bookings', bookingsRouter);
app.use('/auth', authRouter);
app.use('/auth', resendRouter);

// Error handler & 404
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

app.use((req, res) => {
  res.status(404).send('Route not found');
});

module.exports = app;


