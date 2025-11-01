import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../Dashboard.css'; 
import { io } from 'socket.io-client';
import API_BASE_URL, { SOCKET_URL } from '../config/api';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useToast } from './Toast';

const AdminDashboard = () => {
    const { notify } = useToast();
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({
        department: '',
        roomNumber: '',
        capacity: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userName, setUserName] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [capacityFilter, setCapacityFilter] = useState('');
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [editValues, setEditValues] = useState({ department: '', roomNumber: '', capacity: '' });
    const [allBookings, setAllBookings] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const localizer = momentLocalizer(moment);

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const res = await axios.get(`${API_BASE_URL}/rooms`, config);
            // Sort rooms for consistent display
            const sortedRooms = res.data.sort((a, b) => {
                if (a.department < b.department) return -1;
                if (a.department > b.department) return 1;
                return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
            });
            setRooms(sortedRooms);
        } catch (err) {
            setError('Error fetching rooms. Please try again.');
            console.error(err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserName(decodedToken.user.name);
        }
        fetchRooms();
        fetchAllBookings();
        // socket listener
        const socket = io(SOCKET_URL);
        socket.on('booking:created', () => fetchAllBookings());
        socket.on('booking:deleted', () => fetchAllBookings());
        return () => { socket.disconnect(); };
    }, []);

    // Filter rooms before rendering
    const filteredRooms = rooms.filter(room => {
        const departmentMatch = departmentFilter === '' || (room.department && room.department.toLowerCase().includes(departmentFilter.toLowerCase()));
        let capacityMatch = true;
        if (capacityFilter !== '' && !isNaN(Number(capacityFilter)) && Number(capacityFilter) > 0) {
            capacityMatch = room.capacity >= Number(capacityFilter);
        }
        return departmentMatch && capacityMatch;
    });

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            await axios.post(`${API_BASE_URL}/rooms/add`, formData, config);
            setSuccess('Room created successfully!');
            setFormData({ department: '', roomNumber: '', capacity: '' }); // Clear fields
            fetchRooms(); // Refresh the room list
        } catch (err) {
            setError(err.response?.data || 'Failed to create room.');
            console.error(err);
        }
    };

    const startEditRoom = (room) => {
        setEditingRoomId(room._id);
        setEditValues({ department: room.department || '', roomNumber: room.roomNumber || '', capacity: String(room.capacity ?? '') });
    };

    const cancelEditRoom = () => {
        setEditingRoomId(null);
        setEditValues({ department: '', roomNumber: '', capacity: '' });
    };

    const onEditChange = e => setEditValues({ ...editValues, [e.target.name]: e.target.value });

    const saveRoom = async (roomId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.put(`${API_BASE_URL}/rooms/${roomId}`, {
                department: editValues.department,
                roomNumber: editValues.roomNumber,
                capacity: Number(editValues.capacity)
            }, config);
            setSuccess('Room updated successfully!');
            notify({ type: 'success', title: 'Updated', message: 'Room details saved.' });
            cancelEditRoom();
            fetchRooms();
        } catch (err) {
            setError(err.response?.data || 'Failed to update room.');
            notify({ type: 'error', title: 'Update Failed', message: err.response?.data || 'Please check inputs.' });
        }
    };

    const deleteRoom = async (roomId) => {
        if (!window.confirm('Delete this room?')) return;
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            await axios.delete(`${API_BASE_URL}/rooms/${roomId}`, config);
            setSuccess('Room deleted.');
            notify({ type: 'info', title: 'Deleted', message: 'Room removed.' });
            fetchRooms();
        } catch (err) {
            setError(err.response?.data || 'Failed to delete room.');
            notify({ type: 'error', title: 'Delete Failed', message: err.response?.data || 'Try again.' });
        }
    };

    const fetchAllBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const res = await axios.get(`${API_BASE_URL}/bookings`, config);
            // Sort by date/time
            const sorted = res.data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setAllBookings(sorted);
        } catch (err) {
            // If unauthorized or error, show message in console; UI still usable
            console.error('Error fetching bookings', err);
        }
    };

    return (
        <div className="page-container">
            <div style={{ position: 'absolute', top: '80px', right: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>
                Welcome, {userName}
            </div>
            <h2 className="page-title">Admin Dashboard</h2>
            <div className="dashboard-layout">
                <div className="dashboard-card">
                    <h3>Create New Room</h3>
                    <form onSubmit={onSubmit}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" className="form-control" name="department" value={formData.department} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Room Number</label>
                            <input type="text" className="form-control" name="roomNumber" value={formData.roomNumber} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Capacity</label>
                            <input type="number" className="form-control" name="capacity" value={formData.capacity} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <input type="submit" value="Create Room" className="btn btn-primary" />
                        </div>
                    </form>
                </div>

                <div className="dashboard-card">
                    <h3>All Rooms</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Filter by Department</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., CSE"
                                value={departmentFilter}
                                onChange={e => setDepartmentFilter(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Filter by Minimum Capacity</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="e.g., 50"
                                value={capacityFilter}
                                onChange={e => setCapacityFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Room Number</th>
                                    <th>Department</th>
                                    <th>Capacity</th>
                                    <th style={{ width: '180px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map(room => (
                                    <tr key={room._id}>
                                        <td>
                                            {editingRoomId === room._id ? (
                                                <input type="text" name="roomNumber" value={editValues.roomNumber} onChange={onEditChange} className="form-control form-control-sm" />
                                            ) : room.roomNumber}
                                        </td>
                                        <td>
                                            {editingRoomId === room._id ? (
                                                <input type="text" name="department" value={editValues.department} onChange={onEditChange} className="form-control form-control-sm" />
                                            ) : room.department}
                                        </td>
                                        <td>
                                            {editingRoomId === room._id ? (
                                                <input type="number" name="capacity" value={editValues.capacity} onChange={onEditChange} className="form-control form-control-sm" />
                                            ) : room.capacity}
                                        </td>
                                        <td>
                                            {editingRoomId === room._id ? (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => saveRoom(room._id)}>Save</button>
                                                    <button className="btn btn-secondary btn-sm ml-2" onClick={cancelEditRoom}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-outline-primary btn-sm" onClick={() => startEditRoom(room)}>Edit</button>
                                                    <button className="btn btn-outline-danger btn-sm ml-2" onClick={() => deleteRoom(room._id)}>Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>Calendar</h3>
                    <div style={{ height: 500 }}>
                        <Calendar
                            localizer={localizer}
                            events={allBookings.map(b => ({
                                id: b._id,
                                title: `${b.room?.roomNumber || ''} - ${b.description}`,
                                start: new Date(b.startTime),
                                end: new Date(b.endTime)
                            }))}
                            startAccessor="start"
                            endAccessor="end"
                            views={['month', 'week', 'day']}
                        />
                    </div>
                </div>

                <div className="dashboard-card">
                    <h3>All Bookings</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                            <label style={{ marginRight: 8 }}>Page size</label>
                            <select value={pageSize} onChange={e => { setPage(1); setPageSize(Number(e.target.value)); }} className="form-control" style={{ display: 'inline-block', width: 90 }}>
                                {[5,10,20,50].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                            <span style={{ margin: '0 10px' }}>{page}</span>
                            <button className="btn btn-outline-secondary btn-sm" disabled={page * pageSize >= allBookings.length} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
                    <div className="table-responsive">
                        {allBookings.length > 0 ? (
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Room</th>
                                        <th>Description</th>
                                        <th>Professor</th>
                                        <th>Dept</th>
                                        <th>Sections</th>
                                        <th>Years</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allBookings.slice((page - 1) * pageSize, page * pageSize).map(b => (
                                        <tr key={b._id}>
                                            <td>{new Date(b.date).toLocaleDateString()}</td>
                                            <td>{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td>{b.room?.roomNumber}</td>
                                            <td>{b.description}</td>
                                            <td>{b.user?.name}</td>
                                            <td>{b.department}</td>
                                            <td>{Array.isArray(b.sections) ? b.sections.join(', ') : ''}</td>
                                            <td>{Array.isArray(b.years) ? b.years.join(', ') : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No bookings to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
