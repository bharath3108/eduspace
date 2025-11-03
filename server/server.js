const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] }
});

// Configure CORS with permissive defaults; restrict via FRONTEND_URL in env if needed
app.use(cors());
app.use(express.json());

// Basic route for root path
app.get('/', (req, res) => {
  res.send('EduSpace API is running');
});

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

// Share io via app locals for routes to emit events
app.locals.io = io;

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Handle 404 - Keep this as the last route
app.use((req, res, next) => {
  res.status(404).send('Route not found');
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
