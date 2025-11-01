import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API_BASE_URL from '../config/api';

const CreateBooking = () => {
    const [username, setUsername] = useState('');
    const [roomName, setRoomName] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/users/`)
            .then(response => {
                if (response.data.length > 0) {
                    setUsers(response.data.map(user => user.username));
                    setUsername(response.data[0].username);
                }
            })
            .catch((error) => {
                console.log(error);
            });

        axios.get(`${API_BASE_URL}/rooms/`)
            .then(response => {
                if (response.data.length > 0) {
                    setRooms(response.data.map(room => `${room.department} - ${room.roomNumber}`));
                    setRoomName(`${response.data[0].department} - ${response.data[0].roomNumber}`);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();

        const booking = {
            username: username,
            roomName: roomName,
            date: date,
            startTime: startTime,
            endTime: endTime
        };

        console.log(booking);

        axios.post(`${API_BASE_URL}/bookings/add`, booking)
            .then(res => console.log(res.data));

        window.location = '/';
    }

    return (
        <div>
            <h3>Create New Booking</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Username: </label>
                    <select
                        required
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}>
                        {
                            users.map(function (user) {
                                return <option
                                    key={user}
                                    value={user}>{user}
                                </option>;
                            })
                        }
                    </select>
                </div>
                <div className="form-group">
                    <label>Room: </label>
                    <select
                        required
                        className="form-control"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}>
                        {
                            rooms.map(function (room) {
                                return <option
                                    key={room}
                                    value={room}>{room}
                                </option>;
                            })
                        }
                    </select>
                </div>
                <div className="form-group">
                    <label>Date: </label>
                    <div>
                        <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Start Time: </label>
                    <div>
                        <DatePicker
                            selected={startTime}
                            onChange={(date) => setStartTime(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>End Time: </label>
                    <div>
                        <DatePicker
                            selected={endTime}
                            onChange={(date) => setEndTime(date)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <input type="submit" value="Create Booking" className="btn btn-primary" />
                </div>
            </form>
        </div>
    )
}

export default CreateBooking;
