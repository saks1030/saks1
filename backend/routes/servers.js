const router = require('express').Router();
let Server = require('../models/server.model');
const auth = require('../middleware/auth');
const { spawn } = require('child_process');
const fs = require('fs');
const runningServers = {};

router.route('/').get(auth, async (req, res) => {
  try {
    const servers = await Server.find({ user: req.user });
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.route('/create').post(auth, async (req, res) => {
  try {
    const { server_name, game_type, version, ram } = req.body;

    if (!server_name || !game_type || !version || !ram) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Find an available port
    const servers = await Server.find().sort({ port: 1 });
    let port = 25565;
    for (const server of servers) {
      if (server.port > port) {
        break;
      }
      port++;
    }

    const newServer = new Server({
      user: req.user,
      server_name,
      game_type,
      version,
      ram,
      port,
    });

    const savedServer = await newServer.save();
    fs.mkdirSync(`./servers/${savedServer._id}`, { recursive: true });
    res.json(savedServer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.route('/start/:id').post(auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ msg: 'Server not found' });
    }
    if (server.user.toString() !== req.user) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const serverProcess = spawn('java', [
      `-Xmx${server.ram}G`,
      '-jar',
      'server.jar', // You need to have the server.jar file in the backend folder
      'nogui',
    ], { cwd: `./servers/${server._id}` }); // We need to create a directory for each server

    runningServers[server._id] = serverProcess;

    serverProcess.stdout.on('data', (data) => {
      console.log(`[${server.server_name}] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[${server.server_name}] ${data}`);
    });

    server.status = 'starting';
    await server.save();

    res.json({ msg: 'Server starting' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.route('/stop/:id').post(auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ msg: 'Server not found' });
    }
    if (server.user.toString() !== req.user) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const serverProcess = runningServers[server._id];
    if (serverProcess) {
      serverProcess.kill();
      delete runningServers[server._id];
    }

    server.status = 'offline';
    await server.save();

    res.json({ msg: 'Server stopped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = function(io) {
  router.route('/start/:id').post(auth, async (req, res) => {
    try {
      const server = await Server.findById(req.params.id);
      if (!server) {
        return res.status(404).json({ msg: 'Server not found' });
      }
      if (server.user.toString() !== req.user) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const serverProcess = spawn('java', [
        `-Xmx${server.ram}G`,
        '-jar',
        'server.jar', // You need to have the server.jar file in the backend folder
        'nogui',
      ], { cwd: `./servers/${server._id}` }); // We need to create a directory for each server

      runningServers[server._id] = serverProcess;

      serverProcess.stdout.on('data', (data) => {
        console.log(`[${server.server_name}] ${data}`);
        io.emit('server-log', { id: server._id, log: data.toString() });
        if (data.toString().includes('Done')) {
          server.status = 'online';
          server.save();
          io.emit('server-status-change', { id: server._id, status: 'online' });
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[${server.server_name}] ${data}`);
        io.emit('server-log', { id: server._id, log: data.toString() });
      });

      server.status = 'starting';
      await server.save();
      io.emit('server-status-change', { id: server._id, status: 'starting' });


      res.json({ msg: 'Server starting' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.route('/stop/:id').post(auth, async (req, res) => {
    try {
      const server = await Server.findById(req.params.id);
      if (!server) {
        return res.status(404).json({ msg: 'Server not found' });
      }
      if (server.user.toString() !== req.user) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const serverProcess = runningServers[server._id];
      if (serverProcess) {
        serverProcess.kill();
        delete runningServers[server._id];
      }

      server.status = 'offline';
      await server.save();
      io.emit('server-status-change', { id: server._id, status: 'offline' });

      res.json({ msg: 'Server stopped' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
}
