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
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                } else {
                    const newUser = {
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        pfp: profile.photos[0].value,
                        rollNumber: profile.emails[0].value.split('@')[0], // Extract roll no from email if iitrpr
                        department: 'Unknown', // Placeholder
                        degree: 'B.Tech', // Placeholder
                        yearOfEntry: new Date().getFullYear().toString()
                    };
                    user = await User.create(newUser);
                    return done(null, user);
                }
            } catch (err) {
                console.error(err);
                return done(err, null);
            }
        }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};
