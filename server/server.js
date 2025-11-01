process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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

// Configure CORS with specific options
app.use(cors({
  origin: [
    'https://eduspace-frontend.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://vscode.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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

// Handle GitHub OAuth callback
app.get('/callback', (req, res) => {
  res.redirect('https://eduspace-frontend.onrender.com');
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
