import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <h1 className="page-title">Welcome back, {user?.name.split(' ')[0]} 👋</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h2 style={{ marginTop: 0 }}>Quick Status</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Semester: <strong>Monsoon 2024</strong></p>
                    <p style={{ color: 'var(--text-secondary)' }}>CGPA: <strong>8.5</strong></p>
                    <p style={{ color: 'var(--text-secondary)' }}>Credits: <strong>18</strong></p>
                </div>

                <Link to="/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}>
                        <h2 style={{ marginTop: 0, color: 'var(--primary-color)' }}>View Courses →</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Check your current semester courses.</p>
                    </div>
                </Link>

                <Link to="/feedback" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass-panel" style={{ padding: '24px', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}>
                        <h2 style={{ marginTop: 0, color: 'var(--secondary-color)' }}>Submit Feedback →</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Give anonymous feedback to instructors.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
