const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('./models/User');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'place_holder_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret',
        callbackURL: "/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                if (!email.endsWith('@iitrpr.ac.in')) {
                    return done(null, false, { message: 'Only @iitrpr.ac.in emails are allowed' });
                }

                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    // Check if user exists by email (Account Linking)
                    user = await User.findOne({ email: email });
                    if (user) {
                        // Link Google Account
                        user.googleId = profile.id;
                        if (!user.pfp || user.pfp.includes('ui-avatars')) {
                             user.pfp = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }

                    // New User - Do not create account automatically
                    // Pass profile to callback to allow redirection to register page
                    return done(null, false, { message: 'New User', profile: profile });
                }
            } catch (err) {
                console.error(err);
                return done(err, null);
            }
        }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
