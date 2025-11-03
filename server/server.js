const port = process.env.PORT || 5000;
const app = require('./app');
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] }
});
// Share io via app locals for routes to emit events (local dev only)
app.locals.io = io;

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
