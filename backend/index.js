require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 5000;

app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const serversRouter = require('./routes/servers')(io);
app.use('/servers', serversRouter);

const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

const friendsRouter = require('./routes/friends');
app.use('/friends', friendsRouter);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
