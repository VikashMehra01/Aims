const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Local Register Step 1: Validate & Send OTP (No DB Creation yet)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, degree, yearOfEntry, googleId } = req.body;
        let { rollNumber } = req.body;

        // Ensure rollNumber is undefined if empty string
        if (!rollNumber || rollNumber.trim() === '') {
            rollNumber = undefined;
        }

        if (!email.endsWith('@iitrpr.ac.in')) {
            return res.status(400).json({ msg: 'Only @iitrpr.ac.in emails are allowed' });
        }

        // Check if user ALREADY exists in DB
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Determine Role
        let role = 'student';
        if (req.body.role === 'faculty') {
            role = 'instructor';
        } else if (req.body.role === 'student') {
            role = 'student';
        } else {
            if (email === 'facultyadvisor@iitrpr.ac.in') {
                role = 'faculty_advisor';
            } else if (/^[a-zA-Z]/.test(email)) {
                role = 'instructor';
            }
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Create Temporary Registration Token (Valid for 10 mins)
        // We store all the user data INSIDE this token so we don't need a DB record yet
        const tempPayload = {
            userData: {
                name,
                rollNumber,
                email,
                password: hashedPassword, // Store hashed password
                department,
                degree,
                yearOfEntry,
                role,
                googleId,
                pfp: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            },
            otp
        };

        const registrationToken = jwt.sign(
            tempPayload, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '10m' }
        );

        // Send OTP
        const emailSent = await sendOTP(email, otp);
        
        if (!emailSent) {
             return res.status(500).json({ msg: 'Failed to send OTP email' });
        }

        res.json({ 
            msg: 'OTP sent to email', 
            email, 
            registrationToken // Client must send this back with OTP
        });

    } catch (err) {
        console.error('=== REGISTRATION ERROR ===');
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Verify Registration OTP & Finalize Account Creation
router.post('/verify-registration', async (req, res) => {
    try {
        const { otp, registrationToken } = req.body;

        if (!registrationToken) {
            return res.status(400).json({ msg: 'Missing registration session' });
        }

        // Verify and Decode the Registration Token
        let decoded;
        try {
            decoded = jwt.verify(registrationToken, process.env.JWT_SECRET || 'secret');
        } catch (e) {
            return res.status(400).json({ msg: 'Registration session expired or invalid. Please sign up again.' });
        }

        const { userData, otp: correctOtp } = decoded;

        // Verify OTP
        if (String(otp) !== String(correctOtp)) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Double check if user exists (in case they verified in another window?)
        let existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
             return res.status(400).json({ msg: 'User already registered' });
        }

        // === CREATE USER NOW ===
        const newUser = new User({
            ...userData,
            isVerified: true // Auto-verified since they passed OTP check
        });

        await newUser.save();

        // Generate Login Token
        const payload = { user: { id: newUser.id, role: newUser.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { name: newUser.name, role: newUser.role } });
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
        console.log('LOGIN - Creating JWT with payload:', JSON.stringify(payload));
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            console.log('LOGIN - JWT created successfully');
            res.json({ token, user: { name: user.name, rollNumber: user.rollNumber, pfp: user.pfp, role: user.role } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) return next(err);

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // If user not found, it means they need to register
        if (!user) {
            if (info && info.profile) {
                const email = info.profile.emails[0].value;
                const name = encodeURIComponent(info.profile.displayName);
                const googleId = info.profile.id;
                // Redirect to client registration page with pre-filled data
                return res.redirect(`${clientUrl}/register?email=${email}&name=${name}&googleId=${googleId}`);
            }
            return res.redirect(`${clientUrl}/login?error=Google_Auth_Failed`);
        }

        // Login Success
        const payload = { user: { id: user.id, role: user.role } };
        console.log('GOOGLE AUTH - Creating JWT with payload:', JSON.stringify(payload));
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            console.log('GOOGLE AUTH - JWT created successfully');
            res.redirect(`${clientUrl}/login?token=${token}`);
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
