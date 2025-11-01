import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Style imports
import 'bootstrap/dist/css/bootstrap.min.css';
import './Avenger.css';
import './cursor-trail.css';

// Component imports
import Navbar from "./components/navbar.component";
import AdminDashboard from './components/AdminDashboard';
import ProfessorBooking from './components/ProfessorBooking';
import StudentSchedule from './components/StudentSchedule';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PleaseVerifyEmail from './components/PleaseVerifyEmail';
import VerifyEmailPage from './components/VerifyEmailPage';
import { ToastProvider } from './components/Toast';
import ArcReactor from './components/ArcReactor';

// JARVIS cursor trail component
function CursorTrail() {
  useEffect(() => {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);

    const moveTrail = (e) => {
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', moveTrail);

    return () => {
      window.removeEventListener('mousemove', moveTrail);
      document.body.removeChild(trail);
    };
  }, []);
  return null;
}

function App() {
  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.user.role;
    } catch (error) {
      console.error("Invalid token, logging out.", error);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  const getHomeComponent = () => {
    if (!token) {
      return <LoginPage />;
    }
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'professor':
        return <ProfessorBooking />;
      case 'student':
        return <StudentSchedule />;
      default:
        // If role is unknown or token is invalid, force login
        return <LoginPage />;
    }
  };

  return (
      <Router>
        <ArcReactor />
        <CursorTrail />
        {/* JARVIS-inspired animated background layers */}
        <div className="bg-anim"></div>
        <div className="particles-layer"></div>
        <div className="bg-vignette"></div>
        <div className="hud-corner-mask"></div>
        <ToastProvider>
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <Navbar />
            <br/>
            <Routes>
              <Route path="/" element={getHomeComponent()} />
              <Route path="/admin" element={token && userRole === 'admin' ? <AdminDashboard /> : <LoginPage />} />
              <Route path="/book-room" element={token && userRole === 'professor' ? <ProfessorBooking /> : <LoginPage />} />
              <Route path="/schedule" element={token && userRole === 'student' ? <StudentSchedule /> : <LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/please-verify" element={<PleaseVerifyEmail />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Routes>
          </div>
        </ToastProvider>
      </Router>
  );
}

export default App;
