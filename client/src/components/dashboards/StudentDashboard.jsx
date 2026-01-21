import React, { useState } from 'react';
import AvailableCourses from '../courses/AvailableCourses';
import MyRegistrations from '../courses/MyRegistrations';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('available');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Dashboard</h2>

            <div className="flex border-b mb-4">
                <button
                    className={`p-3 ${activeTab === 'available' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('available')}>
                    Available Courses
                </button>
                <button
                    className={`p-3 ${activeTab === 'my_regs' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('my_regs')}>
                    My Registrations
                </button>
            </div>

            {activeTab === 'available' ? <AvailableCourses /> : <MyRegistrations />}
        </div>
    );
};

export default StudentDashboard;
