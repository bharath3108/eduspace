import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const AdminCreateRoom = () => {
    const [formData, setFormData] = useState({
        department: '',
        roomNumber: '',
        capacity: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const { department, roomNumber, capacity } = formData;

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
        } catch (err) {
            setError(err.response.data);
        }
    };

    return (
        <div className="auth-container">
            <h3>Create Room</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Department</label>
                    <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={department}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Room Number</label>
                    <input
                        type="text"
                        className="form-control"
                        name="roomNumber"
                        value={roomNumber}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Capacity</label>
                    <input
                        type="number"
                        className="form-control"
                        name="capacity"
                        value={capacity}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <input type="submit" value="Create Room" className="btn" />
                </div>
            </form>
        </div>
    );
};

export default AdminCreateRoom;