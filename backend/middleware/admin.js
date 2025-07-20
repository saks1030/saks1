const User = require('../models/user.model');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(401).json({ msg: 'User not authorized as admin' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = admin;
