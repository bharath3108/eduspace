const router = require('express').Router();
const jwt = require('jsonwebtoken');
let User = require('../models/user.model');

// Admin-only list users
router.route('/').get((req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can view users');
    }
    User.find()
      .select('-password')
      .then(users => res.json(users))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (error) {
    res.status(401).json('Error: Unauthorized');
  }
});

// Admin update user (role or name)
router.route('/:id').put(async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can update users');
    }
    const { name, role, adminPermissions } = req.body;
    const update = {};
    if (name) update.name = name;
    if (role) update.role = role;
    if (adminPermissions) update.adminPermissions = adminPermissions;
    const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
    if (!updated) return res.status(404).json('User not found');
    res.json(updated);
  } catch (error) {
    res.status(500).json('Server error');
  }
});

// Admin delete user
router.route('/:id').delete(async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can delete users');
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json('User not found');
    res.json('User deleted.');
  } catch (error) {
    res.status(500).json('Server error');
  }
});

module.exports = router;
