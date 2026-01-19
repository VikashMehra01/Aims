require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

const app = express();

// Passport Config
require('./passport')(passport);

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// DB Connection
mongoose.connect(process.env.MONGO_URI)

    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
