const router = require('express').Router();
let Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const sendEmail = require('../utils/email');

// Admin-only: view all bookings
router.route('/').get((req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user.role !== 'admin') {
      return res.status(403).json('Error: Only admins can view all bookings');
    }
    Booking.find()
      .populate('room')
      .populate('user', 'name email')
      .then(bookings => res.json(bookings))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (error) {
    return res.status(401).json('Error: Unauthorized');
  }
});

router.route('/add').post(async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user.role !== 'professor') {
      return res.status(403).json('Error: Only professors can book rooms');
    }

    const {
      description,
      subject,
      sections,
      years,
      department,
      room,
      date,
      startTime
    } = req.body;

    if (!description || !sections || !years || !department || !room || !date || !startTime) {
      return res.status(400).json('Error: All fields are required.');
    }
    
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = new Date(bookingStartTime.getTime() + 60 * 60 * 1000);

    const normalizedSections = Array.isArray(sections)
      ? sections
      : String(sections).split(',').map(s => s.trim()).filter(Boolean);
    const normalizedYears = Array.isArray(years)
      ? years.map(Number)
      : String(years).split(',').map(s => Number(s.trim())).filter(v => !Number.isNaN(v));

    const newBooking = new Booking({
      description,
      subject,
      sections: normalizedSections,
      years: normalizedYears,
      department,
      room,
      user: decoded.user.id,
      date,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
    });

    await newBooking.save();
    // Emit real-time event for new booking
    try {
      req.app.locals.io.emit('booking:created', {
        id: newBooking._id,
        room: newBooking.room,
        department: newBooking.department,
        date: newBooking.date,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime
      });
    } catch (e) {
      console.error('Socket emit failed', e);
    }
    // Email professor confirmation
    try {
      const professor = await User.findById(decoded.user.id);
      if (professor) {
        const { templates } = require('../utils/email');
        const roomDoc = await Room.findById(room);
        const dateText = new Date(date).toLocaleDateString();
        const timeText = bookingStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sectionsText = normalizedSections.join(', ');
        const yearsText = normalizedYears.join(', ');
        const profHtml = templates.professorBooking({ professorName: professor.name, description, subject, department, roomNumber: roomDoc?.roomNumber || '', dateText, timeText, sectionsText, yearsText });
        await sendEmail({ email: professor.email, subject: 'Booking Confirmation', message: 'Booking created', html: profHtml });
      }
      // Email matching students
      const students = await User.find({
        role: 'student',
        isVerified: true,
        branch: department,
        section: { $in: normalizedSections },
        year: { $in: normalizedYears }
      });
      const roomDoc2 = await Room.findById(room);
      const { templates: tpl } = require('../utils/email');
      const dateText2 = new Date(date).toLocaleDateString();
      const timeText2 = bookingStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sectionsText2 = normalizedSections.join(', ');
      const yearsText2 = normalizedYears.join(', ');
      await Promise.all(students.map(s => {
        const html = tpl.studentBooking({ studentName: s.name, description, subject, department, roomNumber: roomDoc2?.roomNumber || '', dateText: dateText2, timeText: timeText2, sectionsText: sectionsText2, yearsText: yearsText2 });
        return sendEmail({ email: s.email, subject: 'Exam Schedule Notice', message: 'Exam scheduled', html });
      }));
    } catch (e) {
      console.error('Email notification error:', e);
    }
    res.json('Booking added!');

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json('Server error');
  }
});

router.route('/availability').post(async (req, res) => {
    try {
        const { date, startTime, department } = req.body;

        if (!date || !startTime || !department) {
            return res.status(400).json('Error: Date, start time, and department are required.');
        }

        const searchDate = new Date(date);
        const searchStartTime = new Date(startTime);
        const searchEndTime = new Date(searchStartTime.getTime() + 59 * 60 * 1000); // 59 minute window to be safe

        // Find all rooms in the given department
        const roomsInDept = await Room.find({ department });
        if (roomsInDept.length === 0) {
            return res.json([]);
        }

        // Find all bookings for the given date that overlap with the requested time window
        const conflictingBookings = await Booking.find({
            room: { $in: roomsInDept.map(r => r._id) },
            date: {
                $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
                $lt: new Date(searchDate.setHours(23, 59, 59, 999))
            },
            $or: [
                // Existing booking starts during the new booking's time slot
                { startTime: { $gte: searchStartTime, $lt: searchEndTime } },
                // Existing booking ends during the new booking's time slot
                { endTime: { $gt: searchStartTime, $lte: searchEndTime } },
                // Existing booking completely contains the new booking's time slot
                { startTime: { $lte: searchStartTime }, endTime: { $gte: searchEndTime } }
            ]
        });
        
        const bookedRoomIds = conflictingBookings.map(booking => booking.room.toString());

        const availableRooms = roomsInDept.filter(room => !bookedRoomIds.includes(room._id.toString()));

        res.json(availableRooms);

    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json('Server error');
    }
});

router.route('/my-bookings').get(async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const bookings = await Booking.find({ user: decoded.user.id }).populate('room');
        res.json(bookings);

    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json('Server error');
    }
});

router.route('/:id').delete(async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json('Booking not found');
        }

        if (booking.user.toString() !== decoded.user.id) {
            return res.status(403).json('User not authorized to delete this booking');
        }

        await Booking.findByIdAndDelete(req.params.id);
        try {
          req.app.locals.io.emit('booking:deleted', { id: req.params.id });
        } catch (e) {
          console.error('Socket emit failed', e);
        }
        res.json('Booking deleted.');

    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json('Server error');
    }
});

router.route('/student-schedule').post(async (req, res) => {
    try {
        const { date, department, section, year } = req.body;

        if (!date || !department || !section || !year) {
            return res.status(400).json('Error: All fields are required.');
        }

        const searchDate = new Date(date);

        const booking = await Booking.findOne({
            department,
            sections: section,
            years: Number(year),
            date: {
                $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
                $lt: new Date(searchDate.setHours(23, 59, 59, 999))
            }
        }).populate('room').populate('user', 'name');

        if (!booking) {
            return res.status(404).json('No exam found for the given details.');
        }

        res.json(booking);

    } catch (error) {
        console.error('Error fetching student schedule:', error);
        res.status(500).json('Server error');
    }
});

module.exports = router;
