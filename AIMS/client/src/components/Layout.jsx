import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <div className="container">
                <Navbar />
                <main className="animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
