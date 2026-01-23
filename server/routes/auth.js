const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Local Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, degree, yearOfEntry, googleId } = req.body;
        let { rollNumber } = req.body;

        // Ensure rollNumber is undefined if empty string (to satisfy sparse unique index)
        if (!rollNumber || rollNumber.trim() === '') {
            rollNumber = undefined;
        }

        if (!email.endsWith('@iitrpr.ac.in')) {
            return res.status(400).json({ msg: 'Only @iitrpr.ac.in emails are allowed' });
        }

        // Determine Role
        let role = 'student';
        if (req.body.role === 'faculty') {
            role = 'instructor';
        } else if (req.body.role === 'student') {
            role = 'student';
        } else {
             // Fallback to legacy email detection if no role provided (or invalid)
            if (email === 'facultyadvisor@iitrpr.ac.in') {
                role = 'faculty_advisor';
            } else if (/^[a-zA-Z]/.test(email)) {
                role = 'instructor';
            }
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            rollNumber,
            email,
            password: hashedPassword,
            department,
            degree,
            yearOfEntry,
            pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role,
            otp,
            otpExpires,
            isVerified: false,
            googleId // Save Google ID if provided
        });

        await user.save();

        // Send OTP
        await sendOTP(email, otp);

        res.json({ msg: 'Registration successful. OTP sent to email.', email });
        
    } catch (err) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Verify Registration OTP
router.post('/verify-registration', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        if (user.isVerified) {
             return res.status(400).json({ msg: 'User already verified. Please login.' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, role: user.role } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const crypto = require('crypto');
const { sendOTP } = require('../utils/emailService');

// Local Login
router.post('/login', async (req, res) => {
    try {
        console.log('Login Request Body:', req.body);
        const { email, password, role } = req.body;

        // Hardcoded Admin Login
        if (email === 'admin@aims.com' && password === 'admin123') {
            // Allow login regardless of role selected, force role to 'admin'
            const payload = { user: { id: 'admin-id', role: 'admin' } };
            jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        name: 'Administrator',
                        email: 'admin@aims.com',
                        role: 'admin',
                        pfp: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
                    }
                });
            });
            return;
        }

        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Check if user has password (might be Google user)
        if (!user.password) return res.status(400).json({ msg: 'Please login with Google' });

        // Check Role if provided
        if (role) {
            // Map 'faculty' to 'instructor' for checking (if UI sends 'faculty')
            // But usually UI sends specific 'instructor' or 'faculty_advisor'
            // Let's assume UI sends 'student', 'instructor', 'faculty_advisor' or 'admin' 
            // OR maybe UI just sends 'faculty' and we check if user is instructor or FA?
            
            // Re-reading usage: user said "choose as faculty or student". 
            // If user selects "Faculty", they might be 'instructor' or 'faculty_advisor'.
            if (role === 'faculty') {
                if (!['instructor', 'faculty_advisor'].includes(user.role)) {
                     return res.status(400).json({ msg: 'Account does not have Faculty privileges' });
                }
            } else if (role !== user.role) {
                 // specific role check
                 // If user is 'faculty_advisor' and selects 'instructor' (if they are separate options?), FA is also an instructor. 
                 // But let's stick to strict match or mapped match.
                 // For now, let's trust the UI sends mapped values or simply:
                 if (role === 'student' && user.role !== 'student') {
                     return res.status(400).json({ msg: 'Invalid role selected for this account' });
                 }
                 // If user is FA, allow 'instructor' login?
                 // Let's keep it simple: If role is provided, user.role must match, OR user.role must be compatible.
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Login Success - No OTP
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: user.name, rollNumber: user.rollNumber, pfp: user.pfp, role: user.role } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) return next(err);
        
        // If user not found, it means they need to register
        if (!user) {
            if (info && info.profile) {
                const email = info.profile.emails[0].value;
                const name = encodeURIComponent(info.profile.displayName);
                const googleId = info.profile.id;
                // Redirect to client registration page with pre-filled data
                return res.redirect(`http://localhost:5173/register?email=${email}&name=${name}&googleId=${googleId}`);
            }
            return res.redirect('http://localhost:5173/login?error=Google_Auth_Failed');
        }

        // Login Success
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.redirect(`http://localhost:5173/login?token=${token}`);
        });
    })(req, res, next);
});

router.get('/me', async (req, res) => {
    // Simple middleware verification
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // Handle Virtual Admin
        if (decoded.user.id === 'admin-id') {
            return res.json({
                _id: 'admin-id',
                name: 'Administrator',
                email: 'admin@aims.com',
                role: 'admin',
                pfp: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff'
            });
        }

        const user = await User.findById(decoded.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

module.exports = router;
