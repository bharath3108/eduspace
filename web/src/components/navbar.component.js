import React from 'react';
import { Link } from 'react-router-dom';
import '../Avenger.css';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    const decodedToken = jwtDecode(token);
    userRole = decodedToken.user.role;
  }

  const logout = () => {
    localStorage.removeItem('token');
    window.location = '/login';
  }

  return (
    <nav className="avenger-nav">
      <div className="nav-brand">
        <img src="/hud-logo.png" alt="EduSpace" className="nav-logo" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
        <Link to="/" className="nav-brand-text">EduSpace</Link>
      </div>
      <div className="nav-links">
        {token ? (
          <>
            {userRole === 'admin' && (
              <>
                {/* <Link to="/admin" className="nav-link">Dashboard</Link> */}
              </>
            )}

            {userRole === 'student' && (
              <>
                {/* <Link to="/schedule" className="nav-link">View Schedule</Link> */}
              </>
            )}
            <a href="#" onClick={logout} className="nav-link">Logout</a>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
