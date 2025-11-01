import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from './Toast';
import API_BASE_URL from '../config/api';

const LoginPage = () => {
    const { notify } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [resendStatus, setResendStatus] = useState('');

    const { email, password, role } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleResendVerification = async () => {
        if (!email) {
            setResendStatus('Please enter your email address above before resending.');
            return;
        }
        setResendStatus('Sending...');
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
            setResendStatus(res.data);
            setError(''); // Clear login error on successful resend
            notify({ type: 'success', title: 'Verification Sent', message: 'Check your inbox for the verification link.' });
        } catch (err) {
            setResendStatus(err.response.data);
            notify({ type: 'error', title: 'Failed', message: err.response?.data || 'Unable to resend verification.' });
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setResendStatus('');
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, formData);
            console.log(res.data);
            // Handle successful login (e.g., save token, redirect)
            localStorage.setItem('token', res.data.token);
            notify({ type: 'success', title: 'Welcome', message: 'Login successful.' });
            window.location = '/'; // Redirect to homepage
        } catch (err) {
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(err.response.data);
                notify({ type: 'error', title: 'Login Failed', message: String(err.response.data) });
            } else {
                // Something happened in setting up the request that triggered an Error
                // This usually means the backend server is down.
                setError('Cannot connect to the server. Please make sure it is running.');
                notify({ type: 'error', title: 'Network', message: 'Cannot reach server.' });
            }
        }
    };

    return (
        <div className="auth-container">
            <h3>Login</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            {resendStatus && <div className="alert alert-info">{resendStatus}</div>}
            <form onSubmit={onSubmit}>
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
                    <label>Login as:</label>
                    <select name="role" value={role} onChange={onChange} className="form-control">
                        <option value="student">Student</option>
                        <option value="professor">Professor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="form-group">
                    <input type="submit" value="Login" className="btn" />
                </div>
            </form>
            {error === 'Please verify your email to log in.' && (
                <div className="mt-3">
                    <p>Didn't receive a verification email?</p>
                    <button className="btn btn-secondary" onClick={handleResendVerification}>
                        Resend Verification Email
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
