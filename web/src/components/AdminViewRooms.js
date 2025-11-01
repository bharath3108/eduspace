import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import API_BASE_URL from '../config/api';

const AdminViewRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const res = await axios.get(`${API_BASE_URL}/rooms`, config);
                
                // Sort rooms
                const sortedRooms = res.data.sort((a, b) => {
                    if (a.department < b.department) return -1;
                    if (a.department > b.department) return 1;
                    if (a.roomNumber < b.roomNumber) return -1;
                    if (a.roomNumber > b.roomNumber) return 1;
                    if (a.capacity < b.capacity) return -1;
                    if (a.capacity > b.capacity) return 1;
                    return 0;
                });

                setRooms(sortedRooms);
            } catch (err) {
                setError('Error fetching rooms');
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="container">
            <h3>All Rooms</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th>Department</th>
                        <th>Room Number</th>
                        <th>Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                        <tr key={room._id}>
                            <td>{room.department}</td>
                            <td>{room.roomNumber}</td>
                            <td>{room.capacity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminViewRooms;
