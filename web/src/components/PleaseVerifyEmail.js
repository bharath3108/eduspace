import React from 'react';
import { Link } from 'react-router-dom';

const PleaseVerifyEmail = () => {
    return (
        <div className="container text-center mt-5">
            <div className="jumbotron">
                <h1 className="display-4">Check Your Email!</h1>
                <p className="lead">A verification link has been sent to your email address.</p>
                <hr className="my-4" />
                <p>Please click the link in the email to activate your account. You will not be able to log in until your email is verified.</p>
                <p className="lead">
                    <Link className="btn btn-primary btn-lg" to="/login" role="button">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default PleaseVerifyEmail;
