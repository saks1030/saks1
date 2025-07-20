const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/user.model');

router.route('/add/:id').post(auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const friend = await User.findById(req.params.id);

    if (!friend) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ msg: 'You are already friends' });
    }

    if (friend.friendRequests.includes(user._id)) {
      return res.status(400).json({ msg: 'Friend request already sent' });
    }

    friend.friendRequests.push(user._id);
    await friend.save();

    res.json({ msg: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.route('/accept/:id').post(auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const friend = await User.findById(req.params.id);

    if (!friend) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.friendRequests.includes(friend._id)) {
      return res.status(400).json({ msg: 'No friend request from this user' });
    }

    user.friendRequests = user.friendRequests.filter(
      (request) => request.toString() !== friend._id.toString()
    );
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await user.save();
    await friend.save();

    res.json({ msg: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
