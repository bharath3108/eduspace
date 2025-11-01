import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        branch: '',
        section: '',
        year: '',
        programType: 'B.Tech'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        // Validate email domain on the client side
        if (role === 'student' && !email.endsWith('@student.nitw.ac.in')) {
            setError('Invalid email domain for student');
            return;
        }
        if (role === 'professor' && !email.endsWith('@nitw.ac.in')) {
            setError('Invalid email domain for professor');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/auth/register`, formData);
            navigate('/please-verify');
        } catch (err) {
            setError(err.response.data);
        }
    };

    return (
        <div className="auth-container">
            <h3>Sign Up</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={name}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={password}
                        onChange={onChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Sign up as:</label>
                    <select name="role" value={role} onChange={onChange} className="form-control">
                        <option value="student">Student</option>
                        <option value="professor">Professor</option>
                    </select>
                </div>

                {role === 'student' && (
                    <>
                        <div className="form-group">
                            <label>Program</label>
                            <select name="programType" value={formData.programType} onChange={onChange} className="form-control">
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Branch (Department)</label>
                            <input type="text" className="form-control" name="branch" value={formData.branch} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Section</label>
                            <input type="text" className="form-control" name="section" value={formData.section} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input type="number" className="form-control" name="year" value={formData.year} onChange={onChange} required />
                        </div>
                    </>
                )}
                <div className="form-group">
                    <input type="submit" value="Sign Up" className="btn" />
                </div>
            </form>
        </div>
    );
};

export default SignupPage;
