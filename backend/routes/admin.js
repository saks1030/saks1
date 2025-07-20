const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/user.model');
const Server = require('../models/server.model');

router.route('/users').get(auth, admin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.route('/servers').get(auth, admin, async (req, res) => {
  try {
    const servers = await Server.find();
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
