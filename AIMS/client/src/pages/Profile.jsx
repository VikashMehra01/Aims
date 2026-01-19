import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="page-title">My Profile</h1>

            <div className="glass-panel" style={{ padding: '40px', display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
                    <img
                        src={user.pfp}
                        alt={user.name}
                        style={{ width: '150px', height: '150px', borderRadius: '50%', border: '4px solid var(--primary-color)', objectFit: 'cover' }}
                    />
                </div>

                <div style={{ flex: '1' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.name}</div>
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Roll Number</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.rollNumber}</div>
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Department</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.department}</div>
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Degree</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.degree}</div>
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Year of Entry</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.yearOfEntry}</div>
                        </div>
                        <div>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email</label>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{user.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
