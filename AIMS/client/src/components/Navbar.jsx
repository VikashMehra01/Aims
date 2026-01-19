import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    return (
        <nav className="navbar glass-panel">
            <div className="navbar-logo">
                <Link to="/dashboard">AIMS Portal</Link>
            </div>
            <div className="navbar-links">
                <Link to="/courses">Courses</Link>
                <Link to="/feedback">Feedback</Link>
                <Link to="/student-record">Academics</Link>
            </div>
            <div className="navbar-profile">
                <span className="roll-number">{user.rollNumber}</span>
                <Link to="/profile">
                    <img
                        src={user.pfp || "https://via.placeholder.com/32"}
                        alt="Profile"
                        className="profile-icon"
                    />
                </Link>
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
