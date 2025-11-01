import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const RoomsList = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/rooms/`)
            .then(response => {
                setRooms(response.data);
            })
            .catch((error) => {
                console.log(error);
            })
    }, []);

    const deleteRoom = (id) => {
        axios.delete(`${API_BASE_URL}/rooms/`+id)
            .then(res => console.log(res.data));
        setRooms(rooms.filter(el => el._id !== id));
    }

    const roomList = () => {
        return rooms.map(currentroom => {
            return <Room room={currentroom} deleteRoom={deleteRoom} key={currentroom._id}/>;
        })
    }

    return (
        <div>
            <h3>Available Rooms</h3>
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th>Department</th>
                        <th>Room Number</th>
                        <th>Strength</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    { roomList() }
                </tbody>
            </table>
        </div>
    )
}

const Room = props => (
    <tr>
      <td>{props.room.department}</td>
      <td>{props.room.roomNumber}</td>
      <td>{props.room.strength}</td>
      <td>
        <a href="#" onClick={() => { props.deleteRoom(props.room._id) }}>delete</a>
      </td>
    </tr>
)

export default RoomsList;
