const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  department: { type: String, required: true },
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
}, {
  timestamps: true,
});

roomSchema.index({ department: 1, roomNumber: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
