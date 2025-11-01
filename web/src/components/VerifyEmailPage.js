import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Verifying your email...');
    const [error, setError] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            axios.get(`${API_BASE_URL}/auth/verify-email?token=${token}`)
                .then(res => {
                    setMessage(res.data);
                    setError(false);
                })
                .catch(err => {
                    setMessage(err.response.data);
                    setError(true);
                });
        } else {
            setMessage('No verification token found.');
            setError(true);
        }
    }, [searchParams]);

    return (
        <div className="container text-center mt-5">
            <div className={`jumbotron ${error ? 'bg-light' : 'bg-light'}`}>
                    <h1 className="display-4 text-success">Verification Status</h1>
                
                <p className="lead" dangerouslySetInnerHTML={{ __html: message }} />

                <hr className="my-4" />
                <p className="lead">
                    <Link className="btn btn-primary btn-lg" to="/login" role="button">
                        Proceed to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
