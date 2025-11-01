import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../Dashboard.css'; // Re-use the dashboard CSS for a consistent look
import { io } from 'socket.io-client';
import API_BASE_URL, { SOCKET_URL } from '../config/api';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useToast } from './Toast';

const ProfessorBooking = () => {
    const { notify } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [department, setDepartment] = useState('');
    const [startTime, setStartTime] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [error, setError] = useState('');
    const [bookingDetails, setBookingDetails] = useState({
        description: '',
        subject: '',
        sections: '', // comma-separated
        years: '', // comma-separated numbers
        department: ''
    });
    const [showBookingFormFor, setShowBookingFormFor] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [userName, setUserName] = useState('');


    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserName(decodedToken.user.name);
        }
        fetchMyBookings();
        // socket listener to refresh on changes
        const socket = io(SOCKET_URL);
        socket.on('booking:created', fetchMyBookings);
        socket.on('booking:deleted', fetchMyBookings);
        return () => { socket.disconnect(); };
    }, []);

    const fetchMyBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const res = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, config);
            setMyBookings(res.data);
        } catch (err) {
            console.error("Could not fetch bookings", err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setAvailableRooms([]);
        if (!department || !selectedDate || !startTime) {
            setError('Please select a date, time, and department.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const searchDateTime = new Date(selectedDate);
            const [hours, minutes] = startTime.split(':');
            searchDateTime.setHours(hours, minutes, 0, 0);

            const body = {
                date: selectedDate,
                startTime: searchDateTime,
                department
            };

            const res = await axios.post(`${API_BASE_URL}/bookings/availability`, body, config);
            setAvailableRooms(res.data);
            if (res.data.length === 0) {
                setError('No rooms available for the selected criteria.');
            }
        } catch (err) {
            setError('Error searching for rooms. Please try again.');
            console.error(err);
        }
    };

    const handleBooking = async (roomId) => {
        setError('');
        if (!bookingDetails.description || !bookingDetails.subject || !bookingDetails.sections || !bookingDetails.years || !bookingDetails.department) {
            setError('Please fill in all booking details.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const searchDateTime = new Date(selectedDate);
            const [hours, minutes] = startTime.split(':');
            searchDateTime.setHours(hours, minutes, 0, 0);

            const body = {
                ...bookingDetails,
                // backend will split into arrays
                room: roomId,
                date: selectedDate,
                startTime: searchDateTime,
            };

            await axios.post(`${API_BASE_URL}/bookings/add`, body, config);
            notify({ type: 'success', title: 'Booked', message: 'Room booked and notifications sent.' });
            
            // Reset state and give feedback
            setShowBookingFormFor(null);
            setAvailableRooms([]);
            setBookingDetails({ description: '', subject: '', sections: '', years: '', department: '' });
            alert('Room booked successfully!');
            fetchMyBookings(); // Refresh my bookings list
            
        } catch (err) {
            setError('Error booking room. It might have been booked by someone else.');
            notify({ type: 'error', title: 'Booking Failed', message: 'Please retry or pick a different slot.' });
            console.error(err);
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`, config);
                notify({ type: 'info', title: 'Deleted', message: 'Your booking has been cancelled.' });
                fetchMyBookings(); // Refresh the list
            } catch (err) {
                setError('Failed to delete booking.');
                notify({ type: 'error', title: 'Delete Failed', message: 'Please try again.' });
            }
        }
    };

    const onBookingDetailChange = e => setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });

    return (
        <div className="page-container">
            <div style={{ position: 'absolute', top: '80px', right: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>
                Welcome, {userName}
            </div>
            <h2 className="page-title">Professor Booking Portal</h2>

            <div className="dashboard-layout">
                {/* Left Column: Search and Available Rooms */}
                <div className="dashboard-card">
                    <h3>My Calendar</h3>
                    <div style={{ height: 450 }}>
                        <Calendar
                            localizer={momentLocalizer(moment)}
                            events={myBookings.map(b => ({
                                id: b._id,
                                title: `${b.room?.roomNumber || ''} - ${b.description}`,
                                start: new Date(b.startTime),
                                end: new Date(b.endTime)
                            }))}
                            startAccessor="start"
                            endAccessor="end"
                            views={['month','week','day']}
                        />
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Find Available Rooms</h3>
                    <form onSubmit={handleSearch}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" className="form-control" value={department} onChange={e => setDepartment(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Select Date</label>
                            <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label>Select Start Time (1-hour slots)</label>
                            <select className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} required>
                                <option value="">Select a time</option>
                                {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Search Availability</button>
                    </form>

                    {availableRooms.length > 0 && (
                        <div className="mt-4">
                            <h4>Available Rooms</h4>
                            <ul className="list-group">
                                {availableRooms.map(room => (
                                    <li key={room._id} className="list-group-item d-flex justify-content-between align-items-center">
                                        Room {room.roomNumber} (Capacity: {room.capacity})
                                        <button className="btn btn-success btn-sm" onClick={() => setShowBookingFormFor(room._id)}>
                                            Book
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {showBookingFormFor && (
                        <div className="mt-4 p-3 border rounded">
                            <h5>Booking Details for Room {availableRooms.find(r => r._id === showBookingFormFor)?.roomNumber}</h5>
                            <div className="form-group">
                                <label>Description (e.g., Midterm Exam)</label>
                                <input type="text" name="description" value={bookingDetails.description} onChange={onBookingDetailChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" name="subject" value={bookingDetails.subject} onChange={onBookingDetailChange} className="form-control" required />
                            </div>
                            <div className="form-group">
                                <label>Sections (comma-separated, e.g., A,B)</label>
                                <input type="text" name="sections" value={bookingDetails.sections} onChange={onBookingDetailChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Years (comma-separated numbers, e.g., 2,3)</label>
                                <input type="text" name="years" value={bookingDetails.years} onChange={onBookingDetailChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" name="department" value={bookingDetails.department} onChange={onBookingDetailChange} className="form-control" />
                            </div>
                            <button className="btn btn-primary" onClick={() => handleBooking(showBookingFormFor)}>Confirm Booking</button>
                            <button className="btn btn-secondary ml-2" onClick={() => setShowBookingFormFor(null)}>Cancel</button>
                        </div>
                    )}
                </div>

                {/* Right Column: My Bookings */}
                <div className="dashboard-card">
                    <h3>My Bookings</h3>
                    <div className="table-responsive">
                        {myBookings.length > 0 ? (
                            <table className="table table-striped table-hover">
                                <thead className="thead-dark">
                                    <tr>
                                        <th>Room</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Description</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myBookings.map(booking => (
                                        <tr key={booking._id}>
                                            <td>{booking.room.roomNumber}</td>
                                            <td>{new Date(booking.date).toLocaleDateString()}</td>
                                            <td>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>{booking.description}</td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBooking(booking._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>You have no bookings.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorBooking;
