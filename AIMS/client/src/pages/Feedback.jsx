import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Feedback = () => {
    const [active, setActive] = useState(false);
    const [feedbackInfo, setFeedbackInfo] = useState({});
    const [formData, setFormData] = useState({ courseInstructor: '', content: '' });
    const [ratings, setRatings] = useState({ clarity: 5, pace: 5, helpfulness: 5 });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkActive = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/feedback/active', {
                    headers: { 'x-auth-token': token }
                });
                setActive(res.data.active);
                setFeedbackInfo(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        checkActive();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/feedback', {
                ...formData,
                ratings,
                feedbackType: feedbackInfo.type
            }, {
                headers: { 'x-auth-token': token }
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (!active) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                <h2>No Active Feedback Session</h2>
                <p>Course feedback is currently closed for this semester.</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                <h2 style={{ color: '#22c55e' }}>Thank You!</h2>
                <p>Your feedback has been submitted successfully.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="page-title">{feedbackInfo.type} Feedback</h1>

            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Select Course / Instructor</label>
                    <select
                        className="input-field"
                        value={formData.courseInstructor}
                        onChange={e => setFormData({ ...formData, courseInstructor: e.target.value })}
                        required
                        style={{ background: 'var(--bg-card)', color: 'white' }}
                    >
                        <option value="">-- Select --</option>
                        <option value="CS301 - Dr. John Doe">CS301 - Dr. John Doe</option>
                        <option value="CS302 - Dr. Jane Smith">CS302 - Dr. Jane Smith</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Rate Clarity (1-5)</label>
                    <input type="range" min="1" max="5" value={ratings.clarity} onChange={e => setRatings({ ...ratings, clarity: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--primary-color)' }}>{ratings.clarity}/5</div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Rate Pace (1-5)</label>
                    <input type="range" min="1" max="5" value={ratings.pace} onChange={e => setRatings({ ...ratings, pace: parseInt(e.target.value) })} style={{ width: '100%' }} />
                    <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--primary-color)' }}>{ratings.pace}/5</div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Comments</label>
                    <textarea
                        className="input-field"
                        rows="4"
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Any additional feedback..."
                    ></textarea>
                </div>

                <button type="submit" className="btn-primary">Submit Feedback</button>
            </form>
        </div>
    );
};

export default Feedback;
