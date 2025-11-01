import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../Dashboard.css'; // Re-use the dashboard CSS
import API_BASE_URL from '../config/api';

const StudentSchedule = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchDetails, setSearchDetails] = useState({
        department: '',
        section: '',
        year: ''
    });
    const [foundBooking, setFoundBooking] = useState(null);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserName(decodedToken.user.name);
        }
    }, []);

    const { department, section, year } = searchDetails;

    const onChange = e => setSearchDetails({ ...searchDetails, [e.target.name]: e.target.value });

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setFoundBooking(null);
        if (!department || !section || !year || !selectedDate) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const body = { ...searchDetails, date: selectedDate };
            const res = await axios.post(`${API_BASE_URL}/bookings/student-schedule`, body, config);
            setFoundBooking(res.data);
        } catch (err) {
            setError(err.response?.data || 'No exam found for the given details.');
        }
    };

    return (
        <div className="page-container">
            <div style={{ position: 'absolute', top: '80px', right: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>
                Welcome, {userName}
            </div>
            <h2 className="page-title">Student Exam Schedule</h2>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr' }}>
                <div className="dashboard-card">
                    <h3>Find Your Exam</h3>
                    <form onSubmit={handleSearch}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="form-group">
                            <label>Department</label>
                            <input type="text" name="department" value={department} onChange={onChange} className="form-control" required />
                        </div>
                        <div className="form-group">
                            <label>Section</label>
                            <input type="text" name="section" value={section} onChange={onChange} className="form-control" required />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input type="number" name="year" value={year} onChange={onChange} className="form-control" required />
                        </div>
                        <div className="form-group">
                            <label>Select Date</label>
                            <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} className="form-control" />
                        </div>
                        <button type="submit" className="btn btn-primary">Search Schedule</button>
                    </form>

                    {foundBooking && (
                        <div className="mt-4 p-4 border rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <h4 style={{ color: '#f0e68c' }}>Your Exam Details</h4>
                            <div className="exam-details">
                                <p><strong>Description:</strong> {foundBooking.description}</p>
                                <p><strong>Room:</strong> {foundBooking.room.roomNumber}</p>
                                <p><strong>Time:</strong> {new Date(foundBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><strong>Professor:</strong> {foundBooking.user.name}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentSchedule;
