import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Courses.css';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/courses', {
                    headers: { 'x-auth-token': token }
                });
                setCourses(res.data);
            } catch (err) {
                console.error(err);
                // Mock data if fetch fails (for demo purposes)
                setCourses([
                    { _id: 1, courseCode: 'CS301', courseName: 'Database Systems', instructor: 'Dr. John Doe', slot: 'A', credits: 4, semester: '5' },
                    { _id: 2, courseCode: 'CS302', courseName: 'Operating Systems', instructor: 'Dr. Jane Smith', slot: 'B', credits: 4, semester: '5' },
                    { _id: 3, courseCode: 'CS303', courseName: 'Computer Networks', instructor: 'Dr. Alan Turing', slot: 'C', credits: 3, semester: '5' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return <div>Loading...</div>;

    const slotGroups = courses.reduce((acc, course) => {
        const slot = course.slot || 'Other';
        if (!acc[slot]) acc[slot] = [];
        acc[slot].push(course);
        return acc;
    }, {});

    return (
        <div>
            <h1 className="page-title">Registered Courses</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>View your courses grouped by time slots.</p>

            <div className="courses-grid">
                {Object.keys(slotGroups).sort().map(slot => (
                    <div key={slot} className="slot-section glass-panel">
                        <div className="slot-header">Slot {slot}</div>
                        {slotGroups[slot].map(course => (
                            <div key={course._id} className="course-item">
                                <div className="course-header">
                                    <div className="course-code">{course.courseCode}</div>
                                    <div className="course-credits">{course.credits} Credits</div>
                                </div>
                                <div className="course-name">{course.courseName}</div>
                                <div className="course-instructor">👨‍🏫 {course.instructor}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
