require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');

const app = express();

// Passport Config
require('./passport')(passport);

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 SESSION MIDDLEWARE (MUST come before passport.session)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// 🔹 PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// DB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
