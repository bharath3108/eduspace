const router = require('express').Router();
const jwt = require('jsonwebtoken');
let Room = require('../models/room.model');

router.route('/').get((req, res) => {
  Room.find()
    .then(rooms => res.json(rooms))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can create rooms');
    }

    const { department, roomNumber, capacity } = req.body;
    console.log('Received room data:', { department, roomNumber, capacity }); // Log incoming data

    if (!department || !roomNumber || !capacity) {
      return res.status(400).json('Error: All fields are required.');
    }

    const newRoom = new Room({
      department,
      roomNumber,
      capacity: Number(capacity),
    });

    newRoom.save()
      .then(() => {
        console.log('Room saved successfully!');
        res.json('Room added!');
      })
      .catch(err => {
        console.error('Error saving room:', err); // Log the full error
        if (err.code === 11000) {
          return res.status(400).json('Error: This room already exists in the department.');
        }
        res.status(400).json('Error: ' + err.message);
      });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    res.status(500).json('Server error');
  }
});

// Update room (admin only)
router.route('/:id').put(async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can update rooms');
    }

    const { department, roomNumber, capacity } = req.body;
    const update = {};
    if (department) update.department = department;
    if (roomNumber) update.roomNumber = roomNumber;
    if (capacity !== undefined) update.capacity = Number(capacity);

    const updated = await Room.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json('Room not found');
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json('Error: This room already exists in the department.');
    }
    console.error('Error updating room:', error);
    res.status(500).json('Server error');
  }
});

// Delete room (admin only)
router.route('/:id').delete(async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can delete rooms');
    }

    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json('Room not found');
    res.json('Room deleted.');
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json('Server error');
  }
});

module.exports = router;
